import { useState } from 'react';
import { Compass, Menu, Search, Sparkles } from 'lucide-react';
import PromptInput from './components/PromptInput';
import ResultView from './components/ResultView';
import SavedTrips from './components/SavedTrips';
import ItineraryRail from './components/itinerary/ItineraryRail';
import MapView from './components/map/MapView';
import { saveTrip } from './lib/api';
import { useTripGenerator } from './hooks/useTripGenerator';

export default function App() {
  const { status, result, setResult, errorReason, errorMessage, lastInput, generate, retry, loadResult } = useTripGenerator();
  const [saveStatus, setSaveStatus] = useState('idle');
  const [activeDay, setActiveDay] = useState(1);
  const [activeStopId, setActiveStopId] = useState(null);

  async function saveCurrentTrip() {
    if (!result || !lastInput) return;
    setSaveStatus('saving');
    try { await saveTrip(lastInput, result); setSaveStatus('saved'); } catch { setSaveStatus('error'); }
  }

  function selectDay(day) {
    setActiveDay(day);
    const firstStop = result?.days.find((item) => item.day === day)?.stops[0];
    setActiveStopId(firstStop?.id || null);
  }

  function selectStop(stop) {
    setActiveStopId(stop.id);
    if (stop.day) setActiveDay(stop.day);
  }

  const hasRoute = status === 'success' && result && result.days.length > 0 && result.days.some((day) => day.stops.length > 0);

  return (
    <div className="nomad-app">
      <header className="nomad-header"><a href="/" className="nomad-brand"><span><Compass size={17} /></span> NOMAD<span className="brand-ai">AI</span></a><div className="header-location"><span className="live-dot" /> Atlas online</div><div className="header-actions"><button type="button" aria-label="Search" className="header-icon"><Search size={18} /></button><button type="button" aria-label="Menu" className="header-icon"><Menu size={18} /></button></div></header>

      {hasRoute ? (
        <main className="map-workspace">
          <ItineraryRail itinerary={result} activeDay={activeDay} activeStopId={activeStopId} onSelectDay={selectDay} onSelectStop={selectStop} onSave={saveCurrentTrip} saveStatus={saveStatus} />
          <section className="map-stage"><MapView itinerary={result} activeStopId={activeStopId} activeDay={activeDay} onSelectStop={selectStop} /><div className="mobile-route-handle" /><div className="mobile-route-title"><div><span className="eyebrow">Your route</span><h2>{result.destination}</h2></div><span>{result.days.length} days</span></div></section>
        </main>
      ) : (
        <main className="planner-home"><section className="home-copy"><p className="eyebrow"><Sparkles size={14} /> AI trip planner</p><h1>Go somewhere<br /><em>worth remembering.</em></h1><p>Tell us where you&apos;re starting, where you want to go, and what kind of story you want to bring home.</p></section><PromptInput status={status} onSubmit={generate} /><ResultView status={status} result={result} errorReason={errorReason} errorMessage={errorMessage} onRetry={retry} onChange={setResult} /><div className="home-secondary"><SavedTrips onLoad={(itinerary, input) => { loadResult(itinerary, input); setActiveDay(1); }} /><div className="home-note"><span>01</span><p>Routes are built from your pace, not a checklist.</p></div></div></main>
  )}

      {hasRoute && <div className="map-mobile-prompt"><PromptInput status={status} onSubmit={generate} /></div>}
      <footer className="nomad-footer"><span>OPENSTREETMAP × NOMADAI</span><span>Make a plan. Keep the magic.</span></footer>
    </div>
  );
}
