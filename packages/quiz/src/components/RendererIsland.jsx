import { PostHogProvider, AnalyticsProvider } from '@hospital-capilar/shared/analytics';
import QuizRenderer from './QuizRenderer';

export default function RendererIsland({ slug }) {
  return (
    <PostHogProvider>
      <AnalyticsProvider>
        <QuizRenderer slug={slug} />
      </AnalyticsProvider>
    </PostHogProvider>
  );
}
