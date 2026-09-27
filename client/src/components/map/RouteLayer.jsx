import { useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';

const colors = ['#6f75ff', '#b883ff', '#55d6a4', '#f2b35d'];

export default function RouteLayer({ points, dayIndex, active }) {
  const map = useMap();

  useEffect(() => {
    if (!active || points.length === 0) return;
    map.fitBounds(points, { padding: [70, 70], maxZoom: 14, animate: true });
  }, [active, map, points]);

  if (points.length < 2) return null;
  return <Polyline positions={points} pathOptions={{ color: colors[dayIndex % colors.length], weight: active ? 5 : 3, opacity: active ? 0.9 : 0.35, dashArray: active ? '1 10' : undefined, className: 'route-draw' }} />;
}
