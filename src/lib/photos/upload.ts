import exifr from "exifr";

import { apiRequestAuth } from "@/lib/api/authenticated";
import { createClient } from "@/lib/supabase/client";
import type { PhotoUploadInitResponse } from "@/types/api";

const PHOTOS_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "Photos";

export type GpsFromExif = {
  lat: number;
  lng: number;
  takenAt?: string;
  width?: number;
  height?: number;
};

export async function readGpsFromFile(file: File): Promise<GpsFromExif | null> {
  const exif = await exifr.parse(file, { gps: true });
  if (!exif?.latitude || !exif?.longitude) {
    return null;
  }

  return {
    lat: exif.latitude,
    lng: exif.longitude,
    takenAt: exif.DateTimeOriginal?.toISOString?.() ?? undefined,
    width: exif.ImageWidth,
    height: exif.ImageHeight,
  };
}

async function sha256Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function uploadGeotaggedPhoto(file: File): Promise<string> {
  const gps = await readGpsFromFile(file);
  if (!gps) {
    throw new Error("This photo has no GPS data in its EXIF.");
  }

  const supabase = createClient();
  const hash = await sha256Hex(file);

  const init = await apiRequestAuth<PhotoUploadInitResponse>("/v1/photos/upload-url", {
    method: "POST",
    body: {
      mime_type: file.type || "image/jpeg",
      size_bytes: file.size,
      lat: gps.lat,
      lng: gps.lng,
      sha256: hash,
      taken_at: gps.takenAt ?? null,
      width: gps.width ?? null,
      height: gps.height ?? null,
    },
  });

  const { error: storageError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(init.storage_path, file, { upsert: true, contentType: file.type });

  if (storageError) {
    if (storageError.message.toLowerCase().includes("bucket not found")) {
      throw new Error(
        'Storage bucket "photos" does not exist. In Supabase go to Storage → New bucket → name it exactly "photos", then run supabase/migrations/002_storage_policies.sql in the SQL Editor.',
      );
    }
    throw new Error(storageError.message);
  }

  await apiRequestAuth(`/v1/photos/${init.photo_id}/finalize`, {
    method: "POST",
  });

  return init.photo_id;
}
