export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint text-2xl">~</div>
      <h2 className="font-display text-2xl">A quiet itinerary</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">This trip has no days yet. Try describing the pace and places you want to explore.</p>
    </div>
  );
}
