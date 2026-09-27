import DayCard from './DayCard';

export default function DayList({ itinerary, onChange }) {
  function removeStop(dayIndex, stopIndex) {
    onChange({
      ...itinerary,
      days: itinerary.days.map((day, index) => index === dayIndex
        ? { ...day, stops: day.stops.filter((_, current) => current !== stopIndex) }
        : day)
    });
  }

  function reorderStop(dayIndex, from, to) {
    const day = itinerary.days[dayIndex];
    if (!day || to < 0 || to >= day.stops.length) return;
    const stops = [...day.stops];
    const [moved] = stops.splice(from, 1);
    stops.splice(to, 0, moved);
    onChange({
      ...itinerary,
      days: itinerary.days.map((current, index) => index === dayIndex ? { ...current, stops } : current)
    });
  }

  return (
    <div className="space-y-4">
      {itinerary.days.map((day, index) => (
        <DayCard key={`${day.day}-${index}`} day={day} dayIndex={index} onRemoveStop={removeStop} onReorderStop={reorderStop} />
      ))}
    </div>
  );
}
