export default function LoadingState() {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white/70 p-8 text-center shadow-soft" role="status">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-ink/10 border-t-coral" />
      <h2 className="font-display text-2xl">Mapping your days</h2>
      <p className="mt-2 text-sm text-ink/60">Finding a rhythm of places, pauses, and good food.</p>
    </div>
  );
}
