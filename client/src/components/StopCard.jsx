export default function StopCard({ stop, stopIndex, stopCount, onRemove, onMove }) {
  return (
    <article className="group flex gap-3 rounded-xl border border-ink/10 bg-white p-4 shadow-sm sm:gap-4">
      <div className="w-14 shrink-0 pt-0.5 text-xs font-bold uppercase tracking-wide text-coral">{stop.time || 'Anytime'}</div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-ink">{stop.name}</h3>
        <p className="mt-1 text-sm leading-6 text-ink/60">{stop.description || 'A stop to shape your day.'}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1 opacity-100 sm:opacity-0 sm:transition group-hover:opacity-100">
        <button type="button" onClick={() => onMove(stopIndex, -1)} disabled={stopIndex === 0} aria-label={`Move ${stop.name} up`} className="h-8 w-8 rounded-lg text-ink/60 hover:bg-mint disabled:opacity-25">^</button>
        <button type="button" onClick={() => onMove(stopIndex, 1)} disabled={stopIndex === stopCount - 1} aria-label={`Move ${stop.name} down`} className="h-8 w-8 rounded-lg text-ink/60 hover:bg-mint disabled:opacity-25">v</button>
        <button type="button" onClick={() => onRemove(stopIndex)} aria-label={`Remove ${stop.name}`} className="h-8 w-8 rounded-lg text-coral hover:bg-[#fff0eb]">x</button>
      </div>
    </article>
  );
}
