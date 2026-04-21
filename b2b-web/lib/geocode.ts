export type GeocodeResult = {
  lat: number;
  lng: number;
};

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const query = address.trim();
  if (!query) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}
