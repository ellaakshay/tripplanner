import { useRef, useState } from 'react';
import { generateTrip } from '../lib/api';
import { parseAndValidate } from '../lib/validateResult';

const TIMEOUT_MS = 35000;

export function useTripGenerator() {
  const requestId = useRef(0);
  const lastRequest = useRef(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorReason, setErrorReason] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastInput, setLastInput] = useState('');

  async function generate(tripRequest) {
    const id = ++requestId.current;
    lastRequest.current = tripRequest;
    setLastInput(tripRequest.prompt?.trim() || `${tripRequest.from} to ${tripRequest.to}`);
    setStatus('loading');
    setErrorReason(null);
    setErrorMessage('');

    try {
      const raw = await Promise.race([
        generateTrip(tripRequest),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS))
      ]);
      if (id !== requestId.current) return;
      const parsed = parseAndValidate(raw);
      if (!parsed.ok) {
        setStatus('error');
        setErrorReason(parsed.reason);
        setErrorMessage('The planner returned data in an unexpected format.');
        return;
      }
      setResult(parsed.data);
      setStatus('success');
    } catch (error) {
      if (id !== requestId.current) return;
      setStatus('error');
      setErrorReason(error.message === 'timeout' ? 'timeout' : 'request_failed');
      setErrorMessage(error.message);
    }
  }

  function loadResult(itinerary, userInput = '') {
    ++requestId.current;
    lastRequest.current = null;
    setResult(itinerary);
    setLastInput(userInput);
    setErrorReason(null);
    setErrorMessage('');
    setStatus('success');
  }

  return { status, result, setResult, errorReason, errorMessage, lastInput, generate, retry: () => lastRequest.current && generate(lastRequest.current), loadResult };
}
