"use client";

import { useCallback, useState } from "react";

import { MapView, type SelectedMapPhoto } from "@/components/map/map-view";
import { PhotoLightbox } from "@/components/map/photo-lightbox";
import { PhotoSidebar } from "@/components/map/photo-sidebar";
import type { PhotoListItem } from "@/types/api";

export function MapPageClient() {
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedMapPhoto | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [flyToTarget, setFlyToTarget] = useState<{
    lng: number;
    lat: number;
    zoom?: number;
  } | null>(null);

  const handleSidebarSelect = useCallback((photo: PhotoListItem) => {
    setFlyToTarget({ lng: photo.lng, lat: photo.lat, zoom: 13 });
    setSelectedPhoto({ id: photo.id, lat: photo.lat, lng: photo.lng });
  }, []);

  const handlePhotoDeleted = useCallback(() => {
    setSelectedPhoto(null);
    setRefreshToken((t) => t + 1);
  }, []);

  return (
    <div className="relative h-full w-full">
      <PhotoSidebar
        refreshToken={refreshToken}
        selectedPhotoId={selectedPhoto?.id ?? null}
        onSelectPhoto={handleSidebarSelect}
      />
      <MapView
        refreshToken={refreshToken}
        flyToTarget={flyToTarget}
        onFlyToComplete={() => setFlyToTarget(null)}
        onSelectPhoto={setSelectedPhoto}
        selectedPhotoId={selectedPhoto?.id ?? null}
      />
      <PhotoLightbox
        key={selectedPhoto?.id ?? "closed"}
        photoId={selectedPhoto?.id ?? null}
        initialLat={selectedPhoto?.lat}
        initialLng={selectedPhoto?.lng}
        onClose={() => setSelectedPhoto(null)}
        onDeleted={handlePhotoDeleted}
      />
    </div>
  );
}
