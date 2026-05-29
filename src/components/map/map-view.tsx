"use client";

import maplibregl from "maplibre-gl";
import { useCallback, useEffect, useRef } from "react";

import {
  ensurePlaceholderIcon,
  featuresToGeoJson,
  loadPhotoMarkerIcon,
  PHOTO_MARKER_LAYER_ID,
  PHOTO_MARKER_LAYOUT,
  PHOTO_MARKER_SOURCE_ID,
  removePhotoMarkerIcon,
} from "@/lib/map/photo-marker-icons";
import { SATELLITE_MAP_STYLE } from "@/lib/map/satellite-style";
import { apiRequestAuth } from "@/lib/api/authenticated";
import type { MapPhotoFeature, MapPhotosResponse } from "@/types/api";

export type SelectedMapPhoto = {
  id: string;
  lat: number;
  lng: number;
};

type MapViewProps = {
  refreshToken?: number;
  flyToTarget?: { lng: number; lat: number; zoom?: number } | null;
  onFlyToComplete?: () => void;
  selectedPhotoId?: string | null;
  onSelectPhoto?: (photo: SelectedMapPhoto | null) => void;
};

export function MapView({
  refreshToken = 0,
  flyToTarget = null,
  onFlyToComplete,
  onSelectPhoto,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const iconByIdRef = useRef<Map<string, string>>(new Map());
  const layerReadyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const applyGeoJson = useCallback((map: maplibregl.Map, features: MapPhotoFeature[]) => {
    const source = map.getSource(PHOTO_MARKER_SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(featuresToGeoJson(features, iconByIdRef.current));
  }, []);

  const syncPhotoIcons = useCallback(
    async (map: maplibregl.Map, features: MapPhotoFeature[]) => {
      ensurePlaceholderIcon(map);

      const nextIds = new Set(features.map((f) => f.id));

      for (const [id] of iconByIdRef.current) {
        if (!nextIds.has(id)) {
          removePhotoMarkerIcon(map, id);
          iconByIdRef.current.delete(id);
        }
      }

      await Promise.all(
        features.map(async (f) => {
          const icon = await loadPhotoMarkerIcon(map, f.id, f.thumb_key);
          iconByIdRef.current.set(f.id, icon);
        }),
      );

      applyGeoJson(map, features);
    },
    [applyGeoJson],
  );

  const loadPhotos = useCallback(
    async (map: maplibregl.Map) => {
      const bounds = map.getBounds();

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
        const data = await apiRequestAuth<MapPhotosResponse>(
          `/v1/photos/map/viewport?${params.toString()}`,
        );

        applyGeoJson(map, data.features);
        void syncPhotoIcons(map, data.features);
      } catch {
        // Map still usable if API is down during local setup.
      }
    },
    [applyGeoJson, syncPhotoIcons],
  );

  const setupPhotoLayer = useCallback(
    (map: maplibregl.Map) => {
      if (layerReadyRef.current) return;

      ensurePlaceholderIcon(map);

      map.addSource(PHOTO_MARKER_SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: PHOTO_MARKER_LAYER_ID,
        type: "symbol",
        source: PHOTO_MARKER_SOURCE_ID,
        layout: PHOTO_MARKER_LAYOUT,
      });

      map.on("mouseenter", PHOTO_MARKER_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", PHOTO_MARKER_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", PHOTO_MARKER_LAYER_ID, (e) => {
        const feature = e.features?.[0];
        const id = feature?.properties?.id;
        const lat = Number(feature?.properties?.lat ?? e.lngLat.lat);
        const lng = Number(feature?.properties?.lng ?? e.lngLat.lng);
        if (typeof id === "string") {
          onSelectPhoto?.({ id, lat, lng });
        }
      });

      layerReadyRef.current = true;
    },
    [onSelectPhoto],
  );

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

    map.on("load", () => {
      setupPhotoLayer(map);
      onMoveEnd();
    });
    map.on("moveend", onMoveEnd);

    return () => {
      layerReadyRef.current = false;
      const icons = iconByIdRef.current;
      icons.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [loadPhotos, setupPhotoLayer]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layerReadyRef.current) return;
    void loadPhotos(map);
  }, [refreshToken, loadPhotos]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToTarget) return;

    map.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToTarget.zoom ?? 13,
      duration: 1200,
      essential: true,
    });

    const onMoveEnd = () => {
      onFlyToComplete?.();
      map.off("moveend", onMoveEnd);
    };
    map.on("moveend", onMoveEnd);
  }, [flyToTarget, onFlyToComplete]);

  return <div ref={containerRef} className="h-full w-full" />;
}
