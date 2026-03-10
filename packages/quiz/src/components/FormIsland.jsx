import { PostHogProvider, AnalyticsProvider } from '@hospital-capilar/shared/analytics';
import DirectFormLanding from './DirectFormLanding';

export default function FormIsland({ nicho }) {
  return (
    <PostHogProvider>
      <AnalyticsProvider>
        <DirectFormLanding nicho={nicho} />
      </AnalyticsProvider>
    </PostHogProvider>
  );
}
