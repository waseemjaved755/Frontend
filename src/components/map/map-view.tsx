"use client";

import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";

import { PhotoLightbox } from "@/components/map/photo-lightbox";
import { SATELLITE_MAP_STYLE } from "@/lib/map/satellite-style";
import { createClient } from "@/lib/supabase/client";
import { apiRequest } from "@/lib/api/client";
import type { MapPhotosResponse } from "@/types/api";

export type SelectedMapPhoto = {
  id: string;
  lat: number;
  lng: number;
};

export function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedMapPhoto | null>(null);

  const loadPhotos = useCallback(async (map: maplibregl.Map) => {
    const bounds = map.getBounds();
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params = new URLSearchParams({
      min_lng: String(bounds.getWest()),
      min_lat: String(bounds.getSouth()),
      max_lng: String(bounds.getEast()),
      max_lat: String(bounds.getNorth()),
    });

    try {
      const data = await apiRequest<MapPhotosResponse>(
        `/v1/photos/map/viewport?${params.toString()}`,
        { token: session.access_token },
      );

      const source = map.getSource("photos") as maplibregl.GeoJSONSource | undefined;
      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: data.features.map((f) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [f.lng, f.lat] },
          properties: { id: f.id, lat: f.lat, lng: f.lng },
        })),
      };

      if (source) {
        source.setData(geojson);
      } else {
        map.addSource("photos", { type: "geojson", data: geojson });
        map.addLayer({
          id: "photo-points",
          type: "circle",
          source: "photos",
          paint: {
            "circle-radius": 11,
            "circle-color": "#38bdf8",
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#ffffff",
          },
        });
        map.on("mouseenter", "photo-points", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "photo-points", () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("click", "photo-points", (e) => {
          const feature = e.features?.[0];
          const id = feature?.properties?.id;
          const lat = Number(feature?.properties?.lat ?? e.lngLat.lat);
          const lng = Number(feature?.properties?.lng ?? e.lngLat.lng);
          if (typeof id === "string") {
            setSelectedPhoto({ id, lat, lng });
          }
        });
      }
    } catch {
      // Map still usable if API is down during local setup.
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: SATELLITE_MAP_STYLE,
      center: [2.3522, 48.8566],
      zoom: 4,
      maxPitch: 0,
      pitch: 0,
      bearing: 0,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    mapRef.current = map;

    const onMoveEnd = () => {
      void loadPhotos(map);
    };

    map.on("load", onMoveEnd);
    map.on("moveend", onMoveEnd);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [loadPhotos]);

  return (
    <>
      <div ref={containerRef} className="h-full w-full" />
      <PhotoLightbox
        key={selectedPhoto?.id ?? "closed"}
        photoId={selectedPhoto?.id ?? null}
        initialLat={selectedPhoto?.lat}
        initialLng={selectedPhoto?.lng}
        onClose={() => setSelectedPhoto(null)}
      />
    </>
  );
}
