import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

const markerIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:999px;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.25)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const userIcon = markerIcon("#0A1628");
const placeIcon = markerIcon("#C8102E");

const FitMapBounds = ({ userLocation, places }) => {
  const map = useMap();

  useEffect(() => {
    const points = [
      [userLocation.lat, userLocation.lng],
      ...places.map((place) => [place.lat, place.lng]),
    ];

    map.fitBounds(points, { padding: [28, 28], maxZoom: 15 });
  }, [map, places, userLocation]);

  return null;
};

const NearbyCareMap = ({ userLocation, places }) => {
  if (!userLocation) return null;

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={13}
      scrollWheelZoom
      className="h-full min-h-[360px] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitMapBounds userLocation={userLocation} places={places} />

      <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
        <Popup>Your location</Popup>
      </Marker>

      {places.map((place) => (
        <Marker key={place.id} position={[place.lat, place.lng]} icon={placeIcon}>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-bold">{place.name}</p>
              <p>{place.category}</p>
              <p>{Math.round(place.distanceMeters || 0)} meters away</p>
              {place.address && <p>{place.address}</p>}
              {place.phone && <p>Phone: {place.phone}</p>}
              {place.website && (
                <a href={place.website} target="_blank" rel="noreferrer">
                  Website
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default NearbyCareMap;
