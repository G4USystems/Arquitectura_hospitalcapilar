import { PostHogProvider, AnalyticsProvider } from '@hospital-capilar/shared/analytics';
import ShortQuizLanding from './ShortQuizLanding';

export default function ShortQuizIsland({ nicho }) {
  return (
    <PostHogProvider>
      <AnalyticsProvider>
        <ShortQuizLanding nicho={nicho} />
      </AnalyticsProvider>
    </PostHogProvider>
  );
}
