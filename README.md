# Wayfarer AI Trip Planner

Wayfarer is an AI-powered trip-planning tool built for the Flam Frontend Internship assignment. A traveler writes one free-form trip brief, the server asks a large language model (LLM) for structured itinerary data, and the React app renders the result as an interactive route and day-by-day plan. It is deliberately **not a chatbot**: model prose is never displayed as a chat conversation.

## Features

- Generate a destination itinerary from a single natural-language prompt.
- Preview origin and destination when the prompt contains a `from ... to ...` route.
- See mapped itinerary stops and a route after generation.
- Expand and collapse days; remove stops or move them earlier or later in their day.
- Save and reload itineraries when MongoDB is configured.
- Use a responsive layout with loading, empty, error, and retry states.

## Technology

- Client: React 19, Vite, React Leaflet, Tailwind CSS.
- API: Node.js 18+, Express, MongoDB/Mongoose for optional saved trips.
- LLM: Groq API, using `openai/gpt-oss-20b` by default.
- Maps and place data: Leaflet with OpenStreetMap tiles; Photon geocoding; Overpass tourist-place lookup.

The LLM API key is read by the server only. The browser sends requests to the local Express API and never calls Groq directly.

## Requirements

- Node.js 18 or newer and npm.
- A Groq API key for itinerary generation.
- MongoDB is optional; it is only needed for saving and reloading trips.
- An internet connection is needed for Groq, map tiles, geocoding, and tourist-place suggestions.

## Setup

1. Install the root, server, and client dependencies:

   ```bash
   npm run install:all
   ```

2. Copy `.env.example` to `.env` (`Copy-Item .env.example .env` in PowerShell), then set `GROQ_API_KEY` in `.env`:

   ```dotenv
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=openai/gpt-oss-20b
   PORT=5002
   ```

   Keep the real `.env` file private. Do not put provider keys in client code or commit them. `MONGODB_URI` is optional; configure it if you want saved trips.

3. Start the API and Vite client together:

   ```bash
   npm run dev
   ```

   The API uses `http://localhost:5002`. Vite normally uses `http://localhost:5173`; if that port is occupied, use the alternate URL printed by Vite.

## Using The Planner

Write the whole request in the trip description field. For example:

> Plan 5 days from Hyderabad to Leh, Ladakh for two travelers. We like mountain scenery, local food, and relaxed mornings. Keep costs moderate.

The full prompt is sent to the API, including origin, destination, duration, traveler details, budget, and interests. Writing `from Hyderabad to Leh, Ladakh` also enables the live route preview while typing. Click **Plan my trip** to generate the itinerary. Expand days, remove stops, or reorder stops with the controls on each stop.

An explicit trip length from 1 to 14 days is enforced when the prompt states a number followed by “day” or “night” (for example, `5 days` or `three nights`). If no duration is stated, the model chooses a practical length. Generated transport times, costs, and place information are suggestions; verify details with current providers before travel.

## LLM And Data Flow

1. `PromptInput` stores the free-form brief in React state and submits `{ "prompt": "..." }` to the client API helper.
2. Express validates that the prompt is present and no more than 2,000 characters.
3. The server sends the prompt to the configured Groq model using a system instruction that requires JSON only and an itinerary schema. `GROQ_MODEL` can be changed to another model available to the account.
4. The server parses JSON, attempts to repair common JSON syntax issues, and makes one corrective model request for an empty/invalid response or an explicit day-count mismatch. Each model attempt has a 15-second timeout.
5. The client normalizes supported itinerary response shapes and validates required fields before rendering. The frontend request timeout is 35 seconds, and stale responses are ignored.
6. React state controls the interactive itinerary; the app does not print the model's raw response into a chat window.

The expected response shape is:

```json
{
  "destination": "Leh, Ladakh",
  "days": [
    {
      "day": 1,
      "title": "Arrival and local exploration",
      "stops": [
        {
          "id": "day-1-stop-1",
          "name": "Leh Palace",
          "time": "Afternoon",
          "travelTime": "About 20 minutes",
          "budget": "Approximate entry cost",
          "crowd": "Moderate",
          "vibe": "Historic",
          "description": "Explore the old palace and its views over Leh."
        }
      ]
    }
  ]
}
```

The client requires a non-empty destination, a days array, a title for each day, and named stops. The server also checks an explicitly requested trip length. Invalid, malformed, timed-out, or failed requests go to a visible error state with a retry action; a valid response with no days has a dedicated empty state.

## API Endpoints

- `POST /api/generate` accepts `{ "prompt": "..." }` and returns a structured itinerary.
- `GET /api/geocode?q=...` resolves a place using Photon.
- `GET /api/places?fromLat=...&fromLng=...&toLat=...&toLng=...` looks up tourist places along the route and near the destination using Overpass.
- `GET /api/health` reports API and MongoDB connection status.
- `GET /api/trips` lists saved trips; `GET /api/trips/:id` loads one; `POST /api/trips` saves one.

Tourist suggestions depend on public OpenStreetMap services. If Overpass is unavailable or rate-limited, the route preview remains available and displays a temporary-unavailable message for suggestions.

## Other Commands

Build the client for production:

```bash
npm run build
```

After building, start the Express server (which serves `client/dist`):

```bash
npm start
```

## Project Layout

- `client/src/components/PromptInput.jsx` contains the trip brief form.
- `client/src/hooks/useTripGenerator.js` manages generation status, timeout, retry, and stale-request protection.
- `client/src/lib/api.js` sends client requests to Express.
- `client/src/lib/validateResult.js` normalizes and validates model output before it reaches itinerary components.
- `client/src/components/DayList.jsx`, `DayCard.jsx`, and `StopCard.jsx` render the editable itinerary.
- `client/src/components/map/` contains the route preview and generated-itinerary map.
- `server/routes/generate.js` builds the structured prompt and calls Groq.
- `server/routes/geocode.js` and `server/routes/places.js` provide map location data.
- `server/routes/trips.js` handles saved itineraries.

## Known Limitations

- AI-generated suggestions can be inaccurate. Verify transport, opening hours, safety advice, and prices before traveling.
- Public geocoding, map tiles, and tourist-place services can be slow, unavailable, or rate-limited.
- Saved trips are shared by the configured database; there is no authentication or per-user privacy.
- Stops can be reordered with buttons within a day; drag-and-drop and moving stops between days are not implemented.
- No automated test suite is currently configured. The client production build and live generation flow have been checked.

## AI Usage Note

GitHub Copilot was used to assist with implementation, debugging, and documentation. The Groq model generates itinerary data at runtime. Review and understand the code and generated results before presenting or extending the project.

## Assignment Submission Checklist

- Add your public or reviewer-accessible repository link.
- Record a short demo showing a prompt, generated itinerary, and stop editing.
- Enter your actual time spent before submitting; it cannot be reliably inferred from the source files.