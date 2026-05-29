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
    <div className="auth-mesh-bg min-h-[calc(100dvh-3.5rem)] px-4 pb-10 pt-[calc(3.5rem+2rem)] sm:px-6 sm:pt-[calc(3.5rem+2.5rem)]">
      <div className="glass-panel mx-auto max-w-lg rounded-2xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Upload a photo</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Only photos with GPS in their EXIF are accepted. After upload, an AI description is
          generated automatically in the background.
        </p>

        <label className="glass-inset mt-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 px-6 py-14 transition hover:border-sky-500/50 hover:bg-sky-500/10">
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

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
