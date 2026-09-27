import DayList from './DayList';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';

export default function ResultView({ status, result, errorReason, errorMessage, onRetry, onChange }) {
  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState reason={errorReason} message={errorMessage} onRetry={onRetry} />;
  if (status !== 'success' || !result) return null;
  if (result.days.length === 0 || result.days.every((day) => day.stops.length === 0)) return <EmptyState />;

  return <DayList itinerary={result} onChange={onChange} />;
}
