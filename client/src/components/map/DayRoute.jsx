import { useMemo } from 'react';
import RouteLayer from './RouteLayer';

export default function DayRoute({ day, dayIndex, geocodedStops, activeDay }) {
  const points = useMemo(() => geocodedStops.filter((stop) => stop.lat && stop.lng).map((stop) => [stop.lat, stop.lng]), [geocodedStops]);
  return <RouteLayer points={points} dayIndex={dayIndex} active={activeDay === day.day} />;
}
