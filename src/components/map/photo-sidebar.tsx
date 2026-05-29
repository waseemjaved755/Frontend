"use client";

import { useEffect, useState } from "react";

import { apiRequestAuth } from "@/lib/api/authenticated";
import { getPhotoSignedUrl } from "@/lib/storage/photos";
import type { PhotoListItem, PhotoListResponse } from "@/types/api";

type PhotoSidebarProps = {
  refreshToken: number;
  selectedPhotoId: string | null;
  onSelectPhoto: (photo: PhotoListItem) => void;
};

function excerpt(text: string | null, maxLen = 72): string {
  if (!text?.trim()) return "No description yet";
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen).trim()}…`;
}

type ThumbState = {
  url: string | null;
};

export function PhotoSidebar({
  refreshToken,
  selectedPhotoId,
  onSelectPhoto,
}: PhotoSidebarProps) {
  const [photos, setPhotos] = useState<PhotoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbs, setThumbs] = useState<Record<string, ThumbState>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadSidebar() {
      if (cancelled) return;

      setLoading(true);

      try {
        const data = await apiRequestAuth<PhotoListResponse>("/v1/photos/mine");

        if (cancelled) return;

        setPhotos(data.photos);

        const entries = await Promise.all(
          data.photos.map(async (photo) => {
            if (!photo.thumb_key) {
              return [photo.id, { url: null }] as const;
            }
            const url = await getPhotoSignedUrl(photo.thumb_key, { width: 120, quality: 78 });
            return [photo.id, { url }] as const;
          }),
        );

        if (!cancelled) {
          setThumbs(Object.fromEntries(entries));
        }
      } catch {
        if (!cancelled) {
          setPhotos([]);
          setThumbs({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSidebar();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return (
    <aside className="photo-sidebar" aria-label="Photo list">
      <div className="photo-sidebar__tab">
        <span className="photo-sidebar__chevron" aria-hidden>
          ›
        </span>
        {!loading && photos.length > 0 ? (
          <span className="photo-sidebar__count">{photos.length}</span>
        ) : null}
      </div>

      <div className="photo-sidebar__drawer">
        <div className="photo-sidebar__header">
          <h2 className="text-sm font-semibold text-white">Your photos</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {loading ? "Loading…" : `${photos.length} on the map`}
          </p>
        </div>

        <ul className="photo-sidebar__list">
          {loading ? (
            <li className="px-3 py-6 text-center text-xs text-zinc-500">Loading photos…</li>
          ) : photos.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-zinc-500">
              Upload a geotagged photo to see it here.
            </li>
          ) : (
            photos.map((photo) => {
              const thumb = thumbs[photo.id];
              const isSelected = selectedPhotoId === photo.id;
              return (
                <li key={photo.id} className="mb-1.5 px-2">
                  <button
                    type="button"
                    onClick={() => onSelectPhoto(photo)}
                    className={`photo-sidebar__item flex w-full gap-3 p-2.5 text-left ${
                      isSelected ? "photo-sidebar__item--selected" : ""
                    }`}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-white/20 bg-zinc-800 shadow-md">
                      {thumb?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-600">
                          <span className="text-[10px]">…</span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-3 text-xs leading-relaxed text-zinc-300">
                        {excerpt(photo.ai_description)}
                      </p>
                      <p className="mt-1 text-[10px] text-zinc-600">
                        {photo.lat.toFixed(2)}, {photo.lng.toFixed(2)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </aside>
  );
}
