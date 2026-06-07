const DEFAULT_OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const FALLBACK_OVERPASS_URLS = [
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const categoryLabels = {
  hospital: "Hospital",
  clinic: "Clinic",
  pharmacy: "Pharmacy",
  doctors: "Doctor",
  doctor: "Doctor",
  dentist: "Dentist",
  emergency: "Emergency",
  ambulance_station: "Ambulance Service",
  ambulance: "Ambulance Service",
};

const toRad = (value) => (value * Math.PI) / 180;

const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const radius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return Math.round(radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const getPlaceType = (tags = {}) => {
  if (tags.emergency === "ambulance_station") return "ambulance_station";
  if (tags.amenity === "ambulance_station") return "ambulance_station";
  if (tags.emergency === "yes") return "emergency";
  return tags.amenity || tags.healthcare || "healthcare";
};

const buildAddress = (tags = {}) => {
  return [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:postcode"],
  ]
    .filter(Boolean)
    .join(", ");
};

const getReadableName = (tags, type) => {
  if (tags.name) return tags.name;
  return `Nearby ${categoryLabels[type] || "Care Center"}`;
};

const isHumanHealthcarePlace = (tags = {}) => {
  const text = `${tags.name || ""} ${tags.amenity || ""} ${tags.healthcare || ""}`.toLowerCase();
  return !["veterinary", "animal", "pet clinic", "pet hospital", "vet "].some((word) =>
    text.includes(word)
  );
};

const buildOverpassQuery = ({ lat, lng, radius }) => `
[out:json][timeout:25];
(
  node["amenity"~"hospital|clinic|pharmacy|doctors|dentist"](around:${radius},${lat},${lng});
  way["amenity"~"hospital|clinic|pharmacy|doctors|dentist"](around:${radius},${lat},${lng});
  relation["amenity"~"hospital|clinic|pharmacy|doctors|dentist"](around:${radius},${lat},${lng});
  node["healthcare"~"hospital|clinic|doctor|pharmacy"](around:${radius},${lat},${lng});
  way["healthcare"~"hospital|clinic|doctor|pharmacy"](around:${radius},${lat},${lng});
  relation["healthcare"~"hospital|clinic|doctor|pharmacy"](around:${radius},${lat},${lng});
  node["amenity"="ambulance_station"](around:${radius},${lat},${lng});
  way["amenity"="ambulance_station"](around:${radius},${lat},${lng});
  relation["amenity"="ambulance_station"](around:${radius},${lat},${lng});
  node["emergency"="ambulance_station"](around:${radius},${lat},${lng});
  way["emergency"="ambulance_station"](around:${radius},${lat},${lng});
  relation["emergency"="ambulance_station"](around:${radius},${lat},${lng});
  node["emergency"="yes"](around:${radius},${lat},${lng});
  way["emergency"="yes"](around:${radius},${lat},${lng});
  relation["emergency"="yes"](around:${radius},${lat},${lng});
);
out tags center;
`;

const mapElementToPlace = (element, userLat, userLng) => {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;

  if (lat === undefined || lng === undefined || !isHumanHealthcarePlace(tags)) return null;

  const type = getPlaceType(tags);
  const name = getReadableName(tags, type);

  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    type,
    category: categoryLabels[type] || "Care Center",
    lat,
    lng,
    address: buildAddress(tags),
    phone: tags.phone || tags["contact:phone"] || "",
    website: tags.website || tags["contact:website"] || "",
    distanceMeters: getDistanceMeters(userLat, userLng, lat, lng),
    openNow: null,
    rating: null,
    source: "OpenStreetMap",
  };
};

const removeDuplicates = (places) => {
  const seen = new Set();

  return places.filter((place) => {
    const key = `${place.name.toLowerCase()}-${place.lat.toFixed(5)}-${place.lng.toFixed(5)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const fetchNearbyCareFromOsm = async ({ lat, lng, radius }) => {
  const endpoints = [process.env.OVERPASS_API_URL || DEFAULT_OVERPASS_URL, ...FALLBACK_OVERPASS_URLS];
  const query = buildOverpassQuery({ lat, lng, radius });
  const body = new URLSearchParams({ data: query });

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "MediCore/1.0 local-development",
        },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Overpass returned ${response.status}: ${errorText.slice(0, 300)}`);
      }

      const data = await response.json();
      const places = (data.elements || [])
        .map((element) => mapElementToPlace(element, lat, lng))
        .filter(Boolean);

      return removeDuplicates(places).sort(
        (first, second) => first.distanceMeters - second.distanceMeters
      );
    } catch (error) {
      console.error("Nearby care fetch failed for endpoint", endpoint, error.message);
      // try next endpoint
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Unable to fetch nearby care from Overpass API endpoints.");
};

const fetchNearbyCare = async ({ lat, lng, radius }) => {
  return fetchNearbyCareFromOsm({ lat, lng, radius });
};

export { fetchNearbyCare, fetchNearbyCareFromOsm, getDistanceMeters };
