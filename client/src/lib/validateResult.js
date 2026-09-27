function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeItinerary(data) {
  if (Array.isArray(data.days) && data.days.every((day) => Array.isArray(day.stops))) return data;
  if (!Array.isArray(data.itinerary)) return data;

  return {
    destination: data.destination,
    days: data.itinerary.map((day) => ({
      day: Number(day.day),
      title: day.title || `Day ${day.day}`,
      stops: (day.stops || []).map((stop, index) => ({
        id: stop.id || `${day.day}-${index}-${stop.name}`,
        name: stop.name,
        time: stop.time || 'Anytime',
        description: stop.description || `${stop.vibe || 'A memorable'} stop with ${stop.crowd || 'a comfortable'} crowds.`,
        travelTime: stop.travelTime,
        budget: stop.budget,
        crowd: stop.crowd,
        vibe: stop.vibe
      }))
    }))
  };
}

export function parseAndValidate(value) {
  let data = value;
  if (typeof value === 'string') {
    try { data = JSON.parse(value); } catch { return { ok: false, reason: 'malformed' }; }
  }

  data = normalizeItinerary(data || {});
  if (!data || !isNonEmptyString(data.destination) || !Array.isArray(data.days)) return { ok: false, reason: 'invalid_shape' };
  if (data.days.length === 0) return { ok: true, data, empty: true };

  const validDays = data.days.every((day) => (
    day && Number.isFinite(day.day) && isNonEmptyString(day.title) && Array.isArray(day.stops) && day.stops.length > 0 &&
    day.stops.every((stop) => stop && isNonEmptyString(stop.name))
  ));
  if (!validDays) return { ok: false, reason: 'invalid_shape' };
  return { ok: true, data };
}
