import { createClient } from "@/lib/supabase/client";

const BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET ?? "Photos";

type SignedUrlOptions = {
  /** Resize for faster preview in the lightbox (Supabase image transformation). */
  width?: number;
  quality?: number;
};

export async function getPhotoSignedUrl(
  storagePath: string,
  options?: SignedUrlOptions,
): Promise<string | null> {
  const supabase = createClient();

  const transform =
    options?.width != null
      ? {
          width: options.width,
          quality: options.quality ?? 82,
          resize: "contain" as const,
        }
      : undefined;

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(
    storagePath,
    3600,
    transform ? { transform } : undefined,
  );

  if (!error && data?.signedUrl) {
    return data.signedUrl;
  }

  // Fallback if image transforms are not enabled on the project
  if (transform) {
    const fallback = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600);
    if (!fallback.error && fallback.data?.signedUrl) {
      return fallback.data.signedUrl;
    }
  }

  return null;
}

/** Preload image in the browser cache before displaying. */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = url;
  });
}
