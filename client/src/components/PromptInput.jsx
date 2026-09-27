import { useState } from 'react';
import TripPreviewMap from './map/TripPreviewMap';

export default function PromptInput({ status, onSubmit }) {
  const [prompt, setPrompt] = useState('');
  const isLoading = status === 'loading';
  const route = prompt.match(/\bfrom\s+(.+?)\s+to\s+(.+?)(?=\s+(?:for|with|on|under|and\s+(?:then\s+)?(?:return|explore|visit|focus))\b|[.!?\n]|$)/i);

  function submit(event) {
    event.preventDefault();
    if (prompt.trim() && !isLoading) onSubmit({ prompt: prompt.trim() });
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-soft sm:p-6">
      <label htmlFor="trip-prompt" className="mb-3 block text-xs font-bold uppercase tracking-[0.18em] text-coral">Describe your trip</label>
      <textarea id="trip-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Plan 5 days from Hyderabad to Ladakh for two people. I love mountain scenery, local food, and relaxed mornings." maxLength={2000} rows={4} required disabled={isLoading} className="min-h-28 w-full resize-y rounded-xl border border-ink/10 bg-paper/60 px-3 py-3 text-sm leading-relaxed text-ink placeholder:text-ink/45 focus:border-coral focus:outline-none" />
      {route && <TripPreviewMap from={route[1].trim()} to={route[2].trim()} />}
      <div className="mt-4 flex flex-col gap-3 border-t border-ink/10 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-ink/50">One trip brief. A route you can shape.</p><button type="submit" disabled={isLoading || !prompt.trim()} className="min-h-12 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition hover:bg-coral disabled:cursor-not-allowed disabled:opacity-40">{isLoading ? 'Planning...' : 'Plan my trip'} <span aria-hidden="true">-&gt;</span></button></div>
    </form>
  );
}
