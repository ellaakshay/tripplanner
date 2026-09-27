import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import { LocateFixed, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import LocationPin from './LocationPin';
import HiddenGemPin from './HiddenGemPin';
import FloatingMapCard from './FloatingMapCard';

const DEFAULT_CENTER = [20, 0];
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
const photos = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1470214304380-aadaedcfff1b?auto=format&fit=crop&w=900&q=80'
];

function MapControls({ points }) {
  const map = useMap();
  function fit() { if (points.length) map.fitBounds(points, { padding: [70, 70], maxZoom: 14 }); }
  return <div className="map-controls"><button type="button" onClick={() => map.zoomIn()} aria-label="Zoom in"><Plus size={17} /></button><button type="button" onClick={() => map.zoomOut()} aria-label="Zoom out"><Minus size={17} /></button><button type="button" onClick={fit} aria-label="Fit route"><Maximize2 size={16} /></button><button type="button" onClick={() => map.locate({ setView: true, maxZoom: 13 })} aria-label="Use current location"><LocateFixed size={16} /></button><button type="button" onClick={() => map.setView(DEFAULT_CENTER, 2)} aria-label="Reset map"><RotateCcw size={16} /></button></div>;
}

function FitAllPoints({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [80, 80], maxZoom: 14, animate: true });
  }, [map, points]);
  return null;
}

async function geocode(query) {
  const response = await fetch(`${API_BASE}/geocode?q=${encodeURIComponent(query)}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) return null;
  const place = await response.json();
  return place ? { lat: Number(place.lat), lng: Number(place.lng), label: place.label } : null;
}

function enrichStop(stop, dayIndex, stopIndex, destination) {
  return { ...stop, day: dayIndex + 1, dayIndex, stopIndex, query: `${stop.name}, ${destination}`, photo: stop.photo || photos[(dayIndex + stopIndex) % photos.length], vibe: stop.vibe || ['Foodie', 'Chill', 'Nature'][stopIndex % 3], crowd: stop.crowd || ['Low', 'Medium', 'High'][stopIndex % 3] };
}

export default function MapView({ itinerary, activeStopId, activeDay, onSelectStop }) {
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const flatStops = useMemo(() => itinerary.days.flatMap((day, dayIndex) => day.stops.map((stop, stopIndex) => enrichStop(stop, dayIndex, stopIndex, itinerary.destination))), [itinerary]);

  useEffect(() => {
    let cancelled = false;
    async function loadLocations() {
      setMapReady(false);
      const located = [];
      const results = await Promise.all(flatStops.map(async (stop) => {
        try { const coords = await geocode(stop.query); return coords ? { ...stop, ...coords } : null; } catch { return null; }
      }));
      located.push(...results.filter(Boolean));
      if (!cancelled) { setStops(located); setMapReady(true); }
    }
    loadLocations();
    return () => { cancelled = true; };
  }, [flatStops]);

  useEffect(() => {
    const active = stops.find((stop) => stop.id === activeStopId);
    if (active) setSelectedStop(active);
  }, [activeStopId, stops]);

  const points = stops.map((stop) => [stop.lat, stop.lng]);
  const center = points[0] || DEFAULT_CENTER;
  function select(stop) { setSelectedStop(stop); onSelectStop(stop); }

  return (
    <div className="map-shell">
      <MapContainer center={center} zoom={points.length ? 12 : 2} scrollWheelZoom zoomControl={false} className="h-full w-full" whenReady={() => setMapReady(true)}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapControls points={points} />
        <FitAllPoints points={points} />
        {points.length > 1 && <Polyline positions={points} pathOptions={{ color: '#3478f6', weight: 5, opacity: 0.9, dashArray: '1 11', className: 'route-draw' }} />}
        {stops.map((stop) => stop.hiddenGem ? <HiddenGemPin key={stop.id} stop={stop} dayIndex={stop.dayIndex} stopIndex={stop.stopIndex} active={stop.id === activeStopId} onSelect={select} /> : <LocationPin key={stop.id} stop={stop} dayIndex={stop.dayIndex} stopIndex={stop.stopIndex} active={stop.id === activeStopId} onSelect={select} />)}
      </MapContainer>
      <div className="map-topbar"><span className="map-status-dot" /> {mapReady ? `${stops.length} places mapped` : 'Mapping your route...'}</div>
      <FloatingMapCard stop={selectedStop} onClose={() => setSelectedStop(null)} />
    </div>
  );
}
