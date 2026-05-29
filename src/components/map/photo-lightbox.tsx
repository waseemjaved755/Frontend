"use client";

import { useCallback, useEffect, useState } from "react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { apiRequestAuth } from "@/lib/api/authenticated";
import { photoLog, photoLogError } from "@/lib/debug";
import { reverseGeocodePlace } from "@/lib/geocoding/reverse";
import { getPhotoSignedUrl, preloadImage } from "@/lib/storage/photos";
import type { Comment, PhotoDetail } from "@/types/api";

type PhotoLightboxProps = {
  photoId: string | null;
  initialLat?: number;
  initialLng?: number;
  onClose: () => void;
  onDeleted?: () => void;
};

const AI_POLL_MS = 2500;
const PREVIEW_WIDTH = 1280;

export function PhotoLightbox({
  photoId,
  initialLat,
  initialLng,
  onClose,
  onDeleted,
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
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const fetchPhotoDetail = useCallback(async (id: string) => {
    return apiRequestAuth<PhotoDetail>(`/v1/photos/${id}`, {
      onMeta: (meta) => photoLog("Photo detail", meta),
    });
  }, []);

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
      setRetryingAi(true);
      try {
        const updated = await apiRequestAuth<PhotoDetail>(`/v1/photos/${id}/describe`, {
          method: "POST",
          body: { image_url: signedUrl ?? undefined, retry },
        });
        setPhoto(updated);
      } catch (err) {
        photoLogError("Describe failed", err);
      } finally {
        setRetryingAi(false);
      }
    },
    [],
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
        const [detail, commentList] = await Promise.all([
          fetchPhotoDetail(photoId),
          apiRequestAuth<Comment[]>(`/v1/photos/${photoId}/comments`),
        ]);

        if (cancelled) return;

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
  }, [photoId, initialLat, initialLng, fetchPhotoDetail, loadPlaceName, loadPreviewImage]);

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
      if (e.key !== "Escape") return;
      if (showDeleteConfirm) {
        setShowDeleteConfirm(false);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, showDeleteConfirm]);

  async function confirmDeletePhoto() {
    if (!photoId || deleting) return;

    setDeleting(true);
    setError(null);

    try {
      await apiRequestAuth(`/v1/photos/${photoId}`, { method: "DELETE" });
      onDeleted?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  async function deleteComment(commentId: string) {
    if (!photoId || deletingCommentId) return;

    setDeletingCommentId(commentId);
    setError(null);

    try {
      await apiRequestAuth(`/v1/photos/${photoId}/comments/${commentId}`, {
        method: "DELETE",
      });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!photoId || !commentText.trim()) return;

    const created = await apiRequestAuth<Comment>(`/v1/photos/${photoId}/comments`, {
      method: "POST",
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
      className="glass-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!showDeleteConfirm) onClose();
      }}
    >
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete this photo?"
        description="The image, AI description, and all comments will be removed permanently. This cannot be undone."
        confirmLabel="Delete photo"
        loading={deleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => void confirmDeletePhoto()}
      />
      <div
        className="glass-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
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
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={deleting || loading}
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger"
            >
              Delete
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              Close
            </button>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-zinc-400">Loading photo…</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-400">{error}</p>
        ) : photo ? (
          <div className="space-y-4 p-5">
            <div className="glass-inset relative min-h-[200px] overflow-hidden rounded-lg">
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

            <div className="glass-inset rounded-lg p-3">
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
                    className="btn-ghost disabled:opacity-50"
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

            <div className="glass-inset rounded-lg p-3">
              <h3 className="text-sm font-medium text-zinc-200">Comments</h3>
              <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                {comments.length === 0 ? (
                  <li className="text-sm text-zinc-500">No comments yet.</li>
                ) : (
                  comments.map((c) => (
                    <li
                      key={c.id}
                      className="glass-inset flex items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-300"
                    >
                      <span className="min-w-0 flex-1 leading-relaxed">{c.body}</span>
                      <button
                        type="button"
                        onClick={() => void deleteComment(c.id)}
                        disabled={deletingCommentId === c.id}
                        className="comment-delete-btn shrink-0"
                        aria-label="Delete comment"
                        title="Delete comment"
                      >
                        {deletingCommentId === c.id ? (
                          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-500 border-t-red-400" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-3.5 w-3.5"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
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
                  className="input-glass flex-1"
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
