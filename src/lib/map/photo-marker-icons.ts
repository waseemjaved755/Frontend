import type { Map as MaplibreMap, SymbolLayerSpecification } from "maplibre-gl";

import { getPhotoSignedUrl } from "@/lib/storage/photos";
import type { MapPhotoFeature } from "@/types/api";

const ICON_SIZE = 56;
const PLACEHOLDER_ICON_ID = "photo-placeholder";

/** Small sky-blue dot used while the thumbnail loads or if the image fails. */
export function ensurePlaceholderIcon(map: MaplibreMap): void {
  if (map.hasImage(PLACEHOLDER_ICON_ID)) return;

  const canvas = document.createElement("canvas");
  canvas.width = ICON_SIZE;
  canvas.height = ICON_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.beginPath();
  ctx.arc(ICON_SIZE / 2, ICON_SIZE / 2, ICON_SIZE / 2 - 3, 0, Math.PI * 2);
  ctx.fillStyle = "#38bdf8";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  const imageData = ctx.getImageData(0, 0, ICON_SIZE, ICON_SIZE);
  map.addImage(PLACEHOLDER_ICON_ID, imageData, { pixelRatio: 2 });
}

function iconIdForPhoto(photoId: string): string {
  return `photo-${photoId}`;
}

async function fetchImageBitmap(url: string): Promise<ImageBitmap> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch marker image");
  }
  const blob = await response.blob();
  return createImageBitmap(blob);
}

/** Draw thumbnail into a round 48×48 sprite for MapLibre. */
async function toRoundMarkerBitmap(source: ImageBitmap): Promise<ImageBitmap> {
  const canvas = document.createElement("canvas");
  canvas.width = ICON_SIZE;
  canvas.height = ICON_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available");

  ctx.save();
  ctx.beginPath();
  ctx.arc(ICON_SIZE / 2, ICON_SIZE / 2, ICON_SIZE / 2 - 3, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(source, 0, 0, ICON_SIZE, ICON_SIZE);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(ICON_SIZE / 2, ICON_SIZE / 2, ICON_SIZE / 2 - 3, 0, Math.PI * 2);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();

  return createImageBitmap(canvas);
}

export async function loadPhotoMarkerIcon(
  map: MaplibreMap,
  photoId: string,
  thumbKey: string | null,
): Promise<string> {
  const iconId = iconIdForPhoto(photoId);
  if (map.hasImage(iconId)) return iconId;

  if (!thumbKey) return PLACEHOLDER_ICON_ID;

  const url = await getPhotoSignedUrl(thumbKey, { width: 96, quality: 80 });
  if (!url) return PLACEHOLDER_ICON_ID;

  try {
    const bitmap = await fetchImageBitmap(url);
    const round = await toRoundMarkerBitmap(bitmap);
    bitmap.close();
    if (!map.hasImage(iconId)) {
      map.addImage(iconId, round, { pixelRatio: 2 });
    }
    round.close();
    return iconId;
  } catch {
    return PLACEHOLDER_ICON_ID;
  }
}

export function removePhotoMarkerIcon(map: MaplibreMap, photoId: string): void {
  const iconId = iconIdForPhoto(photoId);
  if (map.hasImage(iconId)) {
    map.removeImage(iconId);
  }
}

export function featuresToGeoJson(
  features: MapPhotoFeature[],
  iconById: Map<string, string>,
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: features.map((f) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [f.lng, f.lat] },
      properties: {
        id: f.id,
        lat: f.lat,
        lng: f.lng,
        icon: iconById.get(f.id) ?? PLACEHOLDER_ICON_ID,
      },
    })),
  };
}

export const PHOTO_MARKER_LAYER_ID = "photo-points";
export const PHOTO_MARKER_SOURCE_ID = "photos";

/** Icon scales down when zoomed out so markers stay geographically accurate. */
export const PHOTO_MARKER_LAYOUT: SymbolLayerSpecification["layout"] = {
  "icon-image": ["get", "icon"],
  "icon-anchor": "center",
  "icon-allow-overlap": true,
  "icon-ignore-placement": true,
  "icon-size": [
    "interpolate",
    ["linear"],
    ["zoom"],
    3,
    0.5,
    5,
    0.62,
    8,
    0.78,
    11,
    0.92,
    14,
    1.05,
    18,
    1.15,
  ],
};
