import { useEffect, useState } from 'react';
import { listTrips, loadTrip } from '../lib/api';

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}

export default function SavedTrips({ onLoad }) {
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    listTrips().then((items) => {
      setTrips(items);
      setStatus('success');
    }).catch(() => setStatus('unavailable'));
  }, []);

  async function openTrip(id) {
    setLoadingId(id);
    try {
      const saved = await loadTrip(id);
      onLoad(saved.itinerary, saved.userInput);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <aside className="rounded-2xl border border-ink/10 bg-ink p-5 text-paper sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Your atlas</p>
          <h2 className="mt-2 font-display text-2xl">Saved trips</h2>
        </div>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-paper/60">{trips.length}</span>
      </div>
      {status === 'loading' && <p className="mt-8 text-sm text-paper/55">Checking your shelf...</p>}
      {status === 'unavailable' && <p className="mt-8 text-sm leading-6 text-paper/55">Saved trips are offline until MongoDB is connected.</p>}
      {status === 'success' && trips.length === 0 && <p className="mt-8 text-sm leading-6 text-paper/55">Your saved journeys will appear here.</p>}
      {trips.length > 0 && (
        <div className="mt-6 space-y-2">
          {trips.map((trip) => (
            <button key={trip.id} type="button" onClick={() => openTrip(trip.id)} disabled={loadingId === trip.id} className="w-full rounded-xl border border-white/10 px-3 py-3 text-left transition hover:border-mint/50 hover:bg-white/10 disabled:opacity-50">
              <span className="block truncate text-sm font-semibold">{trip.destination}</span>
              <span className="mt-1 block text-xs text-paper/45">{formatDate(trip.createdAt)} {loadingId === trip.id ? ' / Loading...' : ''}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
