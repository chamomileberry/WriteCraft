import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import posthog from 'posthog-js';

// PostHog context with readiness state
const PostHogContext = createContext<{ posthog: typeof posthog; isReady: boolean }>({ 
  posthog, 
  isReady: false 
});

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    const host = import.meta.env.VITE_POSTHOG_HOST;

    if (apiKey && host) {
      posthog.init(apiKey, {
        api_host: host,
        loaded: (posthog) => {
          if (import.meta.env.DEV) {
            console.log('[PostHog] Initialized successfully');
          }
          setIsReady(true);
        },
        capture_pageview: false, // We'll handle pageviews manually
        capture_pageleave: true,
        autocapture: false, // We'll manually track events for better control
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: true, // Privacy: mask form inputs
          maskTextSelector: '[data-private]', // Mask elements with data-private attribute
        },
      });
    } else {
      console.warn('[PostHog] API key or host not configured - analytics disabled');
      setIsReady(true); // Mark as "ready" even if disabled so app doesn't wait
    }

    return () => {
      posthog.reset();
    };
  }, []);

  return (
    <PostHogContext.Provider value={{ posthog, isReady }}>
      {children}
    </PostHogContext.Provider>
  );
}

export function usePostHog() {
  return useContext(PostHogContext);
}

// Analytics helper functions - PostHog queues events internally if not loaded yet
export const analytics = {
  // Page view tracking
  pageView: (path: string, properties?: Record<string, any>) => {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      path,
      ...properties,
    });
  },

  // User identification
  identify: (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties);
  },

  // Event tracking
  track: (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties);
  },

  // Reset on logout
  reset: () => {
    posthog.reset();
  },

  // Feature flags
  isFeatureEnabled: (flag: string): boolean => {
    return posthog.isFeatureEnabled(flag) || false;
  },

  // User properties
  setUserProperties: (properties: Record<string, any>) => {
    posthog.setPersonProperties(properties);
  },

  // Group analytics (for teams)
  group: (groupType: string, groupKey: string, properties?: Record<string, any>) => {
    posthog.group(groupType, groupKey, properties);
  },
};

// Event names constants for consistency
export const EVENTS = {
  // Authentication
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',

  // Content Generation
  GENERATOR_OPENED: 'generator_opened',
  GENERATOR_USED: 'generator_used',
  CONTENT_GENERATED: 'content_generated',
  GENERATION_SAVED: 'generation_saved',
  GENERATION_CANCELLED: 'generation_cancelled',

  // AI Assistant
  AI_CHAT_STARTED: 'ai_chat_started',
  AI_MESSAGE_SENT: 'ai_message_sent',
  AI_RESPONSE_RECEIVED: 'ai_response_received',
  AI_SUGGESTION_ACCEPTED: 'ai_suggestion_accepted',
  AI_ENTITY_CREATED: 'ai_entity_created',

  // Notebook
  NOTEBOOK_CREATED: 'notebook_created',
  NOTEBOOK_OPENED: 'notebook_opened',
  NOTEBOOK_EDITED: 'notebook_edited',
  NOTEBOOK_DELETED: 'notebook_deleted',

  // Projects
  PROJECT_CREATED: 'project_created',
  PROJECT_OPENED: 'project_opened',
  PROJECT_DELETED: 'project_deleted',

  // Characters
  CHARACTER_CREATED: 'character_created',
  CHARACTER_EDITED: 'character_edited',
  CHARACTER_DELETED: 'character_deleted',

  // Timeline
  TIMELINE_CREATED: 'timeline_created',
  TIMELINE_EVENT_ADDED: 'timeline_event_added',
  TIMELINE_VIEW_CHANGED: 'timeline_view_changed',
  TIMELINE_RELATIONSHIP_CREATED: 'timeline_relationship_created',

  // Canvas
  CANVAS_CREATED: 'canvas_created',
  CANVAS_OPENED: 'canvas_opened',
  CANVAS_EDITED: 'canvas_edited',

  // Subscription
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription_downgraded',
  TRIAL_STARTED: 'trial_started',
  PAYMENT_COMPLETED: 'payment_completed',

  // Collaboration
  TEAM_CREATED: 'team_created',
  TEAM_MEMBER_INVITED: 'team_member_invited',
  TEAM_MEMBER_JOINED: 'team_member_joined',

  // Import/Export
  DATA_IMPORTED: 'data_imported',
  DATA_EXPORTED: 'data_exported',

  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
} as const;
