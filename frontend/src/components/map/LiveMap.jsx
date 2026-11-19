import { useEffect, useRef, useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { SocketContext } from '../../context/SocketContext';
import { timeAgo, getImageUrl } from '../../utils/helpers';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon broken by bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const missingIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 32px; height: 32px;
    background: #7f1d1d;
    border: 3px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -36],
});

const sightingIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 28px; height: 28px;
    background: #2563eb;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center;
  "><div style="width:8px;height:8px;background:#fff;border-radius:50%"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

const newSightingIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 32px; height: 32px;
    background: #16a34a;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(22,163,74,0.3);
    animation: pulse 1.5s infinite;
    display: flex; align-items: center; justify-content: center;
  "><div style="width:10px;height:10px;background:#fff;border-radius:50%"></div></div>
  <style>@keyframes pulse{0%,100%{box-shadow:0 0 0 4px rgba(22,163,74,0.3)}50%{box-shadow:0 0 0 10px rgba(22,163,74,0.1)}}</style>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20],
});

const toValidLatLng = (lat, lng) => {
  if (lat == null || lng == null || lat === '' || lng === '') return null;
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (Number.isNaN(numLat) || Number.isNaN(numLng)) return null;
  return [numLat, numLng];
};

const getSightingCoords = (sighting) => {
  if (!sighting) return null;
  const flat = toValidLatLng(sighting.lat, sighting.lng);
  if (flat) return flat;
  const loc = sighting.location;
  if (!loc) return null;
  const lat = loc.lat ?? loc.latitude ?? loc.geoJSON?.coordinates?.[1] ?? loc.coordinates?.[1];
  const lng = loc.lng ?? loc.longitude ?? loc.geoJSON?.coordinates?.[0] ?? loc.coordinates?.[0];
  return toValidLatLng(lat, lng);
};

const getMissingCoords = (person) => {
  if (!person) return null;
  const flat = toValidLatLng(person.lat, person.lng);
  if (flat) return flat;
  const loc = person.lastSeenCoordinates || person.lastKnownCoordinates || person.coordinates;
  if (!loc) return null;
  const lat = loc.lat ?? loc.latitude ?? loc.geoJSON?.coordinates?.[1] ?? loc.coordinates?.[1];
  const lng = loc.lng ?? loc.longitude ?? loc.geoJSON?.coordinates?.[0] ?? loc.coordinates?.[0];
  return toValidLatLng(lat, lng);
};

// Fly-to helper when a new sighting comes in
function FlyToSighting({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 13, { duration: 1.5 });
    }
  }, [target, map]);
  return null;
}

// Auto-fit map bounds once markers/sightings load
function FitBounds({ coordsList }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current || coordsList.length === 0) return;
    if (coordsList.length === 1) {
      map.setView(coordsList[0], 12);
    } else {
      const bounds = L.latLngBounds(coordsList);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
    hasFitted.current = true;
  }, [coordsList, map]);

  return null;
}

export default function LiveMap({ markers = [], sightings = [], mapType = 'markers', isAdmin = false }) {
  const { subscribe } = useContext(SocketContext);
  const [liveSightings, setLiveSightings] = useState(sightings);
  const [flyTarget, setFlyTarget] = useState(null);
  const [newSightingIds, setNewSightingIds] = useState(new Set());

  const DEFAULT_CENTER = [9.0820, 8.6753];
  const DEFAULT_ZOOM = 6;

  useEffect(() => {
    setLiveSightings(sightings);
  }, [sightings]);

  useEffect(() => {
    const unsub = subscribe('new-sighting', (data) => {
      const sighting = data.sighting || data;
      const coords = getSightingCoords(sighting);
      if (!coords) return;

      const sightingId = sighting._id || sighting.id;

      setLiveSightings((prev) => {
        if (prev.find((s) => (s._id || s.id) === sightingId)) return prev;
        return [sighting, ...prev];
      });

      setNewSightingIds((prev) => new Set([...prev, sightingId]));
      setFlyTarget(coords);

      setTimeout(() => {
        setNewSightingIds((prev) => {
          const next = new Set(prev);
          next.delete(sightingId);
          return next;
        });
      }, 10000);
    });

    return unsub;
  }, [subscribe]);

  useEffect(() => {
    const unsub = subscribe('sighting-status-update', (data) => {
      setLiveSightings((prev) =>
        prev.map((s) =>
          (s._id || s.id) === data.sightingId ? { ...s, status: data.status } : s
        )
      );
    });
    return unsub;
  }, [subscribe]);

  const allCoords = [
    ...markers.map(getMissingCoords),
    ...liveSightings.map(getSightingCoords),
  ].filter(Boolean);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ height: '100%', width: '100%', minHeight: '450px' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds coordsList={allCoords} />
      <FlyToSighting target={flyTarget} />

      {/* Missing Persons — red teardrops */}
      {markers.map((person) => {
        const coords = getMissingCoords(person);
        if (!coords) return null;
        const name = person.name || person.fullName || 'Unknown';
        const photo = person.photoUrl || person.photos?.[0];
        const imageSrc = getImageUrl(photo);
        return (
          <Marker key={person.id || person._id} position={coords} icon={missingIcon}>
            <Popup>
              <div className="min-w-[180px]">
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt={name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-gray-500">{person.age} yrs • {person.gender}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Last seen: {person.address || person.lastKnownLocation || person.lastSeenLocation || 'Unknown'}
                </p>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                  Missing
                </span>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Sightings — blue dots (green pulse for new) */}
      {liveSightings.map((sighting) => {
        const coords = getSightingCoords(sighting);
        if (!coords) return null;
        const sightingId = sighting._id || sighting.id;
        const isNew = newSightingIds.has(sightingId);
        const imageSrc = getImageUrl(sighting.imageUrl || sighting.image?.url || sighting.photo);
        return (
          <Marker
            key={sightingId}
            position={coords}
            icon={isNew ? newSightingIcon : sightingIcon}
          >
            <Popup>
              <div className="min-w-[180px]">
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt="Sighting"
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="font-semibold text-gray-900">
                  {isNew && <span className="text-green-600 mr-1">🟢 NEW</span>}
                  Sighting Report
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {sighting.address || sighting.location?.address || 'Location recorded'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {timeAgo(sighting.time || sighting.sightingTime || sighting.createdAt)}
                </p>
                {sighting.description && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {sighting.description}
                  </p>
                )}
                <span
                  className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    sighting.status === 'matched'
                      ? 'bg-green-100 text-green-700'
                      : sighting.status === 'reviewed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {sighting.status || 'pending'}
                </span>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Heatmap-style: circle markers when mapType === 'heatmap' */}
      {mapType === 'heatmap' &&
        liveSightings.map((sighting) => {
          const coords = getSightingCoords(sighting);
          if (!coords) return null;
          return (
            <CircleMarker
              key={`heat-${sighting._id || sighting.id}`}
              center={coords}
              radius={20}
              pathOptions={{
                color: '#2563eb',
                fillColor: '#2563eb',
                fillOpacity: 0.15,
                weight: 0,
              }}
            />
          );
        })}
    </MapContainer>
  );
}