"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest } from "@/lib/api/client";
import { photoLog, photoLogError } from "@/lib/debug";
import { reverseGeocodePlace } from "@/lib/geocoding/reverse";
import { getPhotoSignedUrl, preloadImage } from "@/lib/storage/photos";
import { createClient } from "@/lib/supabase/client";
import type { Comment, PhotoDetail } from "@/types/api";

type PhotoLightboxProps = {
  photoId: string | null;
  initialLat?: number;
  initialLng?: number;
  onClose: () => void;
};

const AI_POLL_MS = 2500;
const PREVIEW_WIDTH = 1280;

export function PhotoLightbox({
  photoId,
  initialLat,
  initialLng,
  onClose,
}: PhotoLightboxProps) {
  const [photo, setPhoto] = useState<PhotoDetail | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [retryingAi, setRetryingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
  }, []);

  const fetchPhotoDetail = useCallback(
    async (id: string) => {
      const token = await getToken();
      if (!token) return null;

      return apiRequest<PhotoDetail>(`/v1/photos/${id}`, {
        token,
        onMeta: (meta) => photoLog("Photo detail", meta),
      });
    },
    [getToken],
  );

  const loadPlaceName = useCallback(async (lat: number, lng: number) => {
    setPlaceLoading(true);
    try {
      const name = await reverseGeocodePlace(lat, lng);
      setPlaceName(name);
    } finally {
      setPlaceLoading(false);
    }
  }, []);

  const loadPreviewImage = useCallback(async (storagePath: string) => {
    setImageLoading(true);
    setImageUrl(null);
    try {
      const url = await getPhotoSignedUrl(storagePath, {
        width: PREVIEW_WIDTH,
        quality: 82,
      });
      if (!url) {
        return;
      }
      await preloadImage(url);
      setImageUrl(url);
    } catch (err) {
      photoLogError("Preview image load failed", err);
    } finally {
      setImageLoading(false);
    }
  }, []);

  const requestAiDescription = useCallback(
    async (id: string, signedUrl: string | null, retry = false) => {
      const token = await getToken();
      if (!token) return;

      setRetryingAi(true);
      try {
        const updated = await apiRequest<PhotoDetail>(`/v1/photos/${id}/describe`, {
          method: "POST",
          token,
          body: { image_url: signedUrl ?? undefined, retry },
        });
        setPhoto(updated);
      } catch (err) {
        photoLogError("Describe failed", err);
      } finally {
        setRetryingAi(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    if (!photoId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      setPlaceName(null);

      if (initialLat != null && initialLng != null) {
        void loadPlaceName(initialLat, initialLng);
      }

      try {
        const token = await getToken();
        if (!token || cancelled) return;

        const [detail, commentList] = await Promise.all([
          fetchPhotoDetail(photoId),
          apiRequest<Comment[]>(`/v1/photos/${photoId}/comments`, { token }),
        ]);

        if (cancelled || !detail) return;

        setPhoto(detail);
        setComments(commentList);

        void loadPlaceName(detail.lat, detail.lng);
        void loadPreviewImage(detail.storage_key_original);
      } catch (err) {
        if (!cancelled) {
          photoLogError("Lightbox load failed", err);
          setError(err instanceof Error ? err.message : "Failed to load photo");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [photoId, initialLat, initialLng, fetchPhotoDetail, getToken, loadPlaceName, loadPreviewImage]);

  useEffect(() => {
    if (!photoId || photo?.ai_status !== "pending") {
      return;
    }

    const interval = window.setInterval(() => {
      void (async () => {
        try {
          const detail = await fetchPhotoDetail(photoId);
          if (!detail) return;
          setPhoto(detail);
        } catch (err) {
          photoLogError("AI poll failed", err);
        }
      })();
    }, AI_POLL_MS);

    return () => window.clearInterval(interval);
  }, [photoId, photo?.ai_status, fetchPhotoDetail]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!photoId || !commentText.trim()) return;

    const token = await getToken();
    if (!token) return;

    const created = await apiRequest<Comment>(`/v1/photos/${photoId}/comments`, {
      method: "POST",
      token,
      body: { body: commentText.trim() },
    });
    setComments((prev) => [created, ...prev]);
    setCommentText("");
  }

  if (!photoId) return null;

  const showGenerating =
    retryingAi || (photo?.ai_status === "pending" && !photo?.ai_description);

  const locationLine =
    placeName ??
    (initialLat != null && initialLng != null
      ? `${initialLat.toFixed(4)}, ${initialLng.toFixed(4)}`
      : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-white">
              {placeLoading && !placeName ? "Looking up location…" : (placeName ?? "Photo")}
            </h2>
            {photo && locationLine ? (
              <p className="mt-0.5 text-sm text-zinc-400">
                {locationLine}
                <span className="text-zinc-600">
                  {" "}
                  · {photo.lat.toFixed(4)}, {photo.lng.toFixed(4)}
                </span>
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-400">Loading photo…</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-400">{error}</p>
        ) : photo ? (
          <div className="space-y-4 p-4">
            <div className="relative min-h-[200px] overflow-hidden rounded-lg bg-zinc-950">
              {imageLoading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-sky-400" />
                  <span className="ml-3 text-sm text-zinc-500">Loading image…</span>
                </div>
              ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={placeName ? `Photo near ${placeName}` : "Geotagged photo"}
                  className="max-h-[50vh] w-full object-contain"
                  decoding="async"
                  fetchPriority="high"
                />
              ) : (
                <p className="p-8 text-center text-sm text-zinc-500">Image preview unavailable.</p>
              )}
            </div>

            <p className="text-xs text-zinc-500">
              {new Date(photo.created_at).toLocaleString()}
              {process.env.NODE_ENV === "development" ? (
                <> · AI: {photo.ai_status}</>
              ) : null}
            </p>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
              <h3 className="text-sm font-medium text-zinc-200">AI description</h3>
              {showGenerating ? (
                <p className="mt-2 text-sm text-zinc-400">
                  Generating description in the background…
                </p>
              ) : photo.ai_description ? (
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {photo.ai_description}
                </p>
              ) : photo.ai_status === "failed" ? (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-amber-400">
                    Description could not be generated automatically.
                  </p>
                  <button
                    type="button"
                    disabled={!imageUrl || retryingAi}
                    onClick={() => void requestAiDescription(photoId, imageUrl, true)}
                    className="rounded-md bg-zinc-700 px-3 py-1.5 text-sm text-white hover:bg-zinc-600 disabled:opacity-50"
                  >
                    Retry AI description
                  </button>
                </div>
              ) : photo.ai_status === "skipped" ? (
                <p className="mt-2 text-sm text-amber-400">
                  AI unavailable. Add GEMINI_API_KEY to backend/.env and restart the API.
                </p>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">No description yet.</p>
              )}
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
              <h3 className="text-sm font-medium text-zinc-200">Comments</h3>
              <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                {comments.length === 0 ? (
                  <li className="text-sm text-zinc-500">No comments yet.</li>
                ) : (
                  comments.map((c) => (
                    <li key={c.id} className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
                      {c.body}
                    </li>
                  ))
                )}
              </ul>
              <form onSubmit={submitComment} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  maxLength={2000}
                  className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
