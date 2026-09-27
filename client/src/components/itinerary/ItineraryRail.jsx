import { AnimatePresence, motion } from 'framer-motion';
import { CloudSun, IndianRupee, MapPin, Save, Sparkles } from 'lucide-react';

const dayColors = ['#6f75ff', '#b883ff', '#55d6a4', '#f2b35d'];

export default function ItineraryRail({ itinerary, activeDay, activeStopId, onSelectDay, onSelectStop, onSave, saveStatus }) {
  return (
    <aside className="itinerary-rail">
      <div className="rail-heading"><div><p className="eyebrow">Your route</p><h1>{itinerary.destination}</h1></div><span className="route-count">{itinerary.days.length} days</span></div>
      <div className="rail-stats"><span><IndianRupee size={14} /> Mid-range</span><span><CloudSun size={14} /> 27°C · Clear</span></div>
      <button type="button" onClick={onSave} disabled={saveStatus === 'saving' || saveStatus === 'saved'} className="save-route-button"><Save size={15} /> {saveStatus === 'saved' ? 'Saved to atlas' : saveStatus === 'saving' ? 'Saving route...' : 'Save this route'}</button>
      <div className="days-scroll">
        {itinerary.days.map((day, dayIndex) => (
          <motion.section layout key={`${day.day}-${dayIndex}`} className={`day-route-card ${activeDay === day.day ? 'is-selected' : ''}`} style={{ '--day-color': dayColors[dayIndex % dayColors.length] }}>
            <button type="button" onClick={() => onSelectDay(day.day)} className="day-route-header"><span className="day-number">{String(day.day).padStart(2, '0')}</span><span className="min-w-0 flex-1 text-left"><span className="day-label">DAY {day.day}</span><strong>{day.title}</strong></span><MapPin size={16} /></button>
            <AnimatePresence initial={false}>
              {activeDay === day.day && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden px-3 pb-3">
                {day.stops.map((stop, stopIndex) => <button type="button" key={stop.id || `${day.day}-${stopIndex}`} onClick={() => onSelectStop({ ...stop, day: day.day })} className={`stop-row ${activeStopId === stop.id ? 'is-active' : ''}`}><span className="stop-time">{stop.time || 'Anytime'}</span><span className="min-w-0 flex-1 truncate text-left">{stop.name}</span><span className="stop-bullet" /></button>)}
              </motion.div>}
            </AnimatePresence>
          </motion.section>
        ))}
      </div>
      <div className="rail-footer"><Sparkles size={15} className="text-indigo-300" /><span>NomadAI found a route with room for the unexpected.</span></div>
    </aside>
  );
}
