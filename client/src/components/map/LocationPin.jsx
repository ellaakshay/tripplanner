import { divIcon } from 'leaflet';
import { Marker, Tooltip } from 'react-leaflet';

const dayColors = ['#6f75ff', '#b883ff', '#55d6a4', '#f2b35d'];

export function createPinIcon(dayIndex, active = false, hiddenGem = false) {
  const color = dayColors[dayIndex % dayColors.length];
  return divIcon({
    className: 'nomad-pin-wrapper',
    html: `<span class="nomad-pin ${active ? 'is-active' : ''} ${hiddenGem ? 'is-gem' : ''}" style="--pin-color:${color}"><span>${hiddenGem ? '✦' : dayIndex + 1}</span></span>`,
    iconSize: [active ? 44 : 34, active ? 52 : 42],
    iconAnchor: [active ? 22 : 17, active ? 46 : 36]
  });
}

export default function LocationPin({ stop, dayIndex, stopIndex, active, onSelect }) {
  return (
    <Marker
      position={[stop.lat, stop.lng]}
      icon={createPinIcon(dayIndex, active, stop.hiddenGem)}
      eventHandlers={{ click: () => onSelect(stop) }}
      zIndexOffset={active ? 1000 : 0}
    >
      <Tooltip direction="top" offset={[0, -28]}>{stop.name}</Tooltip>
    </Marker>
  );
}
