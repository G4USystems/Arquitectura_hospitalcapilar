export function PostHogProvider({ children }) {
  // PostHog is loaded via snippet in BaseLayout.astro <head>
  // window.posthog is already available — no dynamic import needed
  return <>{children}</>;
}

// Export a safe posthog object that won't break if blocked
export const posthog = {
  capture: (...args) => {
    try {
      window.posthog?.capture?.(...args);
    } catch {
      // Silently fail
    }
  },
  identify: (...args) => {
    try {
      window.posthog?.identify?.(...args);
    } catch {
      // Silently fail
    }
  },
  get __loaded() {
    return !!window.posthog?.capture;
  },
  onFeatureFlags: (callback) => {
    try {
      window.posthog?.onFeatureFlags?.(callback);
    } catch {
      // Silently fail
    }
  },
  getFeatureFlag: (flag) => {
    try {
      return window.posthog?.getFeatureFlag?.(flag);
    } catch {
      return null;
    }
  },
};
