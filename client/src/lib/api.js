const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}

export async function generateTrip(tripRequest) {
  return request('/generate', {
    method: 'POST',
    body: JSON.stringify(tripRequest)
  });
}

export function saveTrip(userInput, itinerary) {
  return request('/trips', {
    method: 'POST',
    body: JSON.stringify({ userInput, itinerary })
  });
}

export function listTrips() { return request('/trips'); }

export function loadTrip(id) { return request(`/trips/${id}`); }
