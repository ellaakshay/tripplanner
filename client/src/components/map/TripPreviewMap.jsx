import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { LoaderCircle, MapPin } from 'lucide-react';

const WORLD_CENTER = [20, 0];
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
const originIcon = divIcon({ className: 'preview-pin-wrapper', html: '<span class="preview-pin preview-pin-origin"><b>A</b></span>', iconSize: [30, 30], iconAnchor: [15, 30] });
const destinationIcon = divIcon({ className: 'preview-pin-wrapper', html: '<span class="preview-pin preview-pin-destination"><b>B</b></span>', iconSize: [30, 30], iconAnchor: [15, 30] });
const attractionIcon = divIcon({ className: 'preview-pin-wrapper', html: '<span class="preview-pin preview-pin-attraction">T</span>', iconSize: [24, 24], iconAnchor: [12, 12] });

function FitPreview({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 2) map.fitBounds(points, { padding: [42, 42], maxZoom: 11, animate: true });
  }, [map, points]);
  return null;
}

async function findPlace(query, signal) {
  const response = await fetch(`${API_BASE}/geocode?q=${encodeURIComponent(query)}`, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Location lookup failed.');
  const place = await response.json();
  if (!place) return null;
  return { lat: Number(place.lat), lng: Number(place.lng), label: place.label };
}

async function findTouristPlaces(from, to, signal) {
  const query = new URLSearchParams({
    fromLat: from.lat,
    fromLng: from.lng,
    toLat: to.lat,
    toLng: to.lng
  });
  const response = await fetch(`${API_BASE}/places?${query}`, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Tourist place lookup failed.');
  const result = await response.json();
  return result.places || [];
}

export default function TripPreviewMap({ from, to, onSelectLocation }) {
  const [locations, setLocations] = useState({ from: null, to: null });
  const [attractions, setAttractions] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [placesError, setPlacesError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const points = useMemo(() => [locations.from, locations.to].filter(Boolean).map((place) => [place.lat, place.lng]), [locations]);

  useEffect(() => {
    if (!from.trim() && !to.trim()) {
      setLocations({ from: null, to: null });
      setMessage('');
      return undefined;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setMessage('');
      try {
        const next = { from: null, to: null };
          const [fromPlace, toPlace] = await Promise.all([
            from.trim().length >= 3 ? findPlace(from.trim(), controller.signal).catch(() => null) : null,
            to.trim().length >= 3 ? findPlace(to.trim(), controller.signal).catch(() => null) : null
          ]);
          next.from = fromPlace;
          next.to = toPlace;
        setLocations(next);
        if (!next.from && !next.to) setMessage('Keep typing to locate both places.');
        else if (!next.from || !next.to) setMessage('Add the other place to draw your route.');
      } catch (error) {
        if (error.name !== 'AbortError') setMessage('Map preview is temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    }, 650);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [from, to]);

  useEffect(() => {
    if (!locations.from || !locations.to) {
      setAttractions([]);
      setPlacesLoading(false);
      setPlacesError(false);
      return undefined;
    }

    const controller = new AbortController();
    setPlacesLoading(true);
    setPlacesError(false);
    findTouristPlaces(locations.from, locations.to, controller.signal)
      .then((places) => {
        setAttractions(places);
        setPlacesError(false);
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setAttractions([]);
          setPlacesError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setPlacesLoading(false);
      });
    return () => controller.abort();
  }, [locations]);

  const hasPreview = locations.from || locations.to;
  const routeAttractions = attractions.filter((place) => !place.destination).slice(0, 6);
  const destinationAttractions = attractions.filter((place) => place.destination).slice(0, 6);
  if (!hasPreview && !loading && !message) return null;

  return (
    <div className="trip-preview-map">
      <div className="trip-preview-heading"><span><MapPin size={14} /> Route preview</span>{loading && <LoaderCircle size={14} className="animate-spin" />}</div>
      <div className="trip-preview-canvas">
        <MapContainer center={points[0] || WORLD_CENTER} zoom={points.length ? 8 : 2} zoomControl={false} dragging scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitPreview points={points} />
          {locations.from && <Marker position={[locations.from.lat, locations.from.lng]} icon={originIcon} eventHandlers={{ click: () => onSelectLocation?.('from', locations.from) }}><Tooltip direction="top">Starting point: {from}</Tooltip></Marker>}
          {locations.to && <Marker position={[locations.to.lat, locations.to.lng]} icon={destinationIcon} eventHandlers={{ click: () => onSelectLocation?.('to', locations.to) }}><Tooltip direction="top">Destination: {to}</Tooltip></Marker>}
          {attractions.map((place) => <Marker key={place.id} position={[place.lat, place.lng]} icon={attractionIcon}><Tooltip direction="top">{place.name} ({place.type})</Tooltip></Marker>)}
          {points.length === 2 && <Polyline positions={points} pathOptions={{ color: '#2677e8', weight: 4, opacity: 0.95 }} />}
        </MapContainer>
      </div>
      <div className="trip-preview-places">
        {placesLoading && <p className="trip-preview-message">Finding tourist places along your route...</p>}
        {!placesLoading && points.length === 2 && placesError && <p className="trip-preview-message">Tourist suggestions are temporarily unavailable.</p>}
        {!placesLoading && points.length === 2 && !placesError && attractions.length === 0 && <p className="trip-preview-message">No tourist places found along this route.</p>}
        {routeAttractions.length > 0 && <section><h3>Along the way</h3><ul>{routeAttractions.map((place) => <li key={place.id}>{place.name}</li>)}</ul></section>}
        {destinationAttractions.length > 0 && <section><h3>At your destination</h3><ul>{destinationAttractions.map((place) => <li key={place.id}>{place.name}</li>)}</ul></section>}
      </div>
      <p className="trip-preview-message">{message || (points.length === 2 ? 'Green marks your start; red marks your destination.' : 'Add both places to see the route.')}</p>
    </div>
  );
}
