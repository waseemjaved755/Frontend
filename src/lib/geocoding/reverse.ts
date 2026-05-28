const CACHE = new Map<string, string>();

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
};

type NominatimResult = {
  display_name?: string;
  address?: NominatimAddress;
};

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

function formatPlaceName(data: NominatimResult): string {
  const a = data.address;
  if (!a) {
    return data.display_name?.split(",").slice(0, 2).join(",").trim() ?? "Unknown location";
  }

  const locality =
    a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? a.state;
  const country = a.country;

  if (locality && country) {
    return `${locality}, ${country}`;
  }
  if (country) {
    return country;
  }
  return data.display_name?.split(",").slice(0, 2).join(",").trim() ?? "Unknown location";
}

/** Reverse geocode lat/lng to a short place label (Nominatim / OSM). */
export async function reverseGeocodePlace(lat: number, lng: number): Promise<string> {
  const key = cacheKey(lat, lng);
  const hit = CACHE.get(key);
  if (hit) {
    return hit;
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: "json",
    zoom: "10",
    addressdetails: "1",
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      },
    );

    if (!response.ok) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    const data = (await response.json()) as NominatimResult;
    const label = formatPlaceName(data);
    CACHE.set(key, label);
    return label;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
