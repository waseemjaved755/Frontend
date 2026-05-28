"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { uploadGeotaggedPhoto } from "@/lib/photos/upload";

export function UploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      await uploadGeotaggedPhoto(file);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold text-white">Upload a photo</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Only photos with GPS in their EXIF are accepted. After upload, an AI description is
        generated automatically in the background — it will be ready when you open the photo on
        the map.
      </p>

      <label className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-6 py-14 hover:border-sky-600">
        <span className="text-sm text-zinc-300">
          {loading ? "Uploading… (AI description starts next)" : "Choose a JPEG, PNG, or HEIC file"}
        </span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={loading}
          onChange={onFileChange}
        />
      </label>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
