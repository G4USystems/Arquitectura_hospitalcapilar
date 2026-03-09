import { PostHogProvider, AnalyticsProvider } from '@hospital-capilar/shared/analytics';
import HospitalCapilarQuiz from './HospitalCapilarQuiz';

export default function QuizIsland({ nicho = null }) {
  return (
    <PostHogProvider>
      <AnalyticsProvider>
        <HospitalCapilarQuiz nicho={nicho} />
      </AnalyticsProvider>
    </PostHogProvider>
  );
}
