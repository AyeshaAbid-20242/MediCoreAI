import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -38],
  shadowSize: [41, 41],
});

const getMapLink = (place) => {
  if (!Number.isFinite(place?.lat) || !Number.isFinite(place?.lng)) return null;
  return `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`;
};

const MapCenter = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
};

const NearbyCareMap = ({ userLocation, places = [], userLabel = "Your current location" }) => {
  if (!userLocation) return null;

  const center = [userLocation.lat, userLocation.lng];
  const visiblePlaces = places.filter(
    (place) => Number.isFinite(place.lat) && Number.isFinite(place.lng)
  );

  return (
    <div className="h-full min-h-[360px] overflow-hidden rounded-lg border border-white/10">
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full min-h-[360px] w-full">
        <MapCenter center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} icon={userIcon}>
          <Popup>{userLabel}</Popup>
        </Marker>
        {visiblePlaces.slice(0, 25).map((place) => {
          const mapLink = getMapLink(place);

          return (
            <Marker key={place.id} position={[place.lat, place.lng]} icon={markerIcon}>
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-bold">{place.name}</p>
                  <p>{place.category || "Care Center"}</p>
                  {Number.isFinite(place.distanceMeters) && (
                    <p>
                      {place.distanceMeters >= 1000
                        ? `${(place.distanceMeters / 1000).toFixed(1)} km`
                        : `${place.distanceMeters} m`}
                    </p>
                  )}
                  {place.phone && <p>{place.phone}</p>}
                  {mapLink && (
                    <a href={mapLink} target="_blank" rel="noreferrer">
                      Open map
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default NearbyCareMap;
