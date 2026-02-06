import { useEffect, useRef } from 'react';

// Safely get env vars
const getEnvVar = (key) => {
  try {
    return import.meta.env?.[key] || null;
  } catch {
    return null;
  }
};

export function PostHogProvider({ children }) {
  const posthogRef = useRef(null);
  const posthogKey = getEnvVar('VITE_POSTHOG_KEY');
  const posthogHost = getEnvVar('VITE_POSTHOG_HOST') || 'https://eu.i.posthog.com';

  useEffect(() => {
    // No key = no analytics
    if (!posthogKey || typeof window === 'undefined') {
      console.warn('[PostHog] No API key found. Analytics disabled.');
      return;
    }

    // Dynamically import PostHog to handle ad blockers
    const initPostHog = async () => {
      try {
        const posthogModule = await import('posthog-js');
        const posthog = posthogModule.default;

        posthog.init(posthogKey, {
          api_host: posthogHost,
          capture_pageview: true,
          capture_pageleave: true,
          disable_session_recording: false,
          autocapture: {
            dom_event_allowlist: ['click', 'submit'],
            element_allowlist: ['button', 'a', 'input', 'form'],
            css_selector_allowlist: ['[data-track]'],
          },
          persistence: 'localStorage+cookie',
          bootstrap: {
            featureFlags: {},
          },
          loaded: () => {
            if (import.meta.env?.DEV) {
              window.posthog = posthog;
              console.log('[PostHog] Initialized successfully');
            }
            posthogRef.current = posthog;
          },
        });
      } catch (error) {
        console.warn('[PostHog] Blocked or failed to load:', error?.message || 'unknown');
      }
    };

    initPostHog();

    return () => {
      posthogRef.current?.shutdown?.();
    };
  }, [posthogKey, posthogHost]);

  // Always render children immediately - don't wait for PostHog
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
    return !!window.posthog?.__loaded;
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
