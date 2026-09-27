import { useState } from 'react';
import StopCard from './StopCard';

export default function DayCard({ day, dayIndex, onRemoveStop, onReorderStop }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white/65 shadow-sm">
      <button type="button" onClick={() => setExpanded((current) => !current)} aria-expanded={expanded} className="flex min-h-20 w-full items-center gap-4 px-4 py-4 text-left hover:bg-white sm:px-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-sm font-bold">{String(day.day).padStart(2, '0')}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold uppercase tracking-[0.16em] text-coral">Day {day.day}</span>
          <span className="mt-1 block truncate font-display text-xl sm:text-2xl">{day.title}</span>
        </span>
        <span className="text-xl text-ink/50" aria-hidden="true">{expanded ? '-' : '+'}</span>
      </button>
      {expanded && (
        <div className="space-y-3 border-t border-ink/10 p-3 sm:p-5">
          {day.stops.map((stop, stopIndex) => (
            <StopCard
              key={stop.id || `${dayIndex}-${stopIndex}`}
              stop={stop}
              stopIndex={stopIndex}
              stopCount={day.stops.length}
              onRemove={(index) => onRemoveStop(dayIndex, index)}
              onMove={(index, direction) => onReorderStop(dayIndex, index, index + direction)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
