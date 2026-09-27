import { AlertCircle, RefreshCcw } from 'lucide-react';

const messages = {
  malformed: 'The planner returned unreadable data. A fresh retry should straighten it out.',
  invalid_shape: 'The planner returned an incomplete itinerary. Try adding a little more detail.',
  request_failed: 'The planner could not be reached. Check the server and try again.',
  timeout: 'The planner took too long to respond. Try a shorter or simpler request.'
};

export default function ErrorState({ reason, message, onRetry }) {
  return (
    <div className="planner-error" role="alert">
      <div className="planner-error-icon"><AlertCircle size={18} /></div>
      <div className="min-w-0 flex-1"><p className="planner-error-kicker">Planner connection</p><h2>{reason === 'timeout' ? 'The route took too long.' : 'The planner needs a quick retry.'}</h2><p>{message || messages[reason] || messages.request_failed}</p></div>
      <button type="button" onClick={onRetry} className="planner-error-button"><RefreshCcw size={14} /> Retry</button>
    </div>
  );
}
