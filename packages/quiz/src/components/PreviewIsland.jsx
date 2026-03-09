import { PostHogProvider, AnalyticsProvider } from '@hospital-capilar/shared/analytics';
import QuizPreview from './QuizPreview';

export default function PreviewIsland({ slug }) {
  return (
    <PostHogProvider>
      <AnalyticsProvider>
        <QuizPreview slug={slug} />
      </AnalyticsProvider>
    </PostHogProvider>
  );
}
