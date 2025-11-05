import { PostHog } from "posthog-node";

class ServerAnalytics {
  private client: PostHog | null = null;
  private initialized = false;

  constructor() {
    // Use POSTHOG_* vars for server-side (VITE_* vars are only for client)
    // Fall back to VITE_* vars for backwards compatibility if POSTHOG_* not set
    const apiKey =
      process.env.POSTHOG_API_KEY || process.env.VITE_POSTHOG_API_KEY;
    const host = process.env.POSTHOG_HOST || process.env.VITE_POSTHOG_HOST;

    if (apiKey && host) {
      try {
        this.client = new PostHog(apiKey, {
          host,
          flushAt: 20,
          flushInterval: 10000,
        });
        this.initialized = true;
        console.log(
          "[ServerAnalytics] PostHog initialized for server-side tracking",
        );
      } catch (error) {
        console.error("[ServerAnalytics] Failed to initialize PostHog:", error);
      }
    } else {
      console.warn(
        "[ServerAnalytics] PostHog not configured - server analytics disabled",
      );
    }
  }

  capture(event: {
    distinctId: string;
    event: string;
    properties?: Record<string, any>;
  }): void {
    if (!this.client || !this.initialized) {
      return;
    }

    try {
      this.client.capture({
        distinctId: event.distinctId,
        event: event.event,
        properties: event.properties || {},
      });
    } catch (error) {
      console.error("[ServerAnalytics] Failed to capture event:", error);
    }
  }

  identify(userId: string, properties?: Record<string, any>): void {
    if (!this.client || !this.initialized) {
      return;
    }

    try {
      this.client.identify({
        distinctId: userId,
        properties: properties || {},
      });
    } catch (error) {
      console.error("[ServerAnalytics] Failed to identify user:", error);
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      try {
        await this.client.shutdown();
        console.log("[ServerAnalytics] PostHog client shut down");
      } catch (error) {
        console.error("[ServerAnalytics] Error shutting down PostHog:", error);
      }
    }
  }
}

export const serverAnalytics = new ServerAnalytics();

export const SERVER_EVENTS = {
  SECURITY_AUTH_FAILURE: "security_auth_failure",
  SECURITY_RATE_LIMIT: "security_rate_limit",
  SECURITY_CSRF_FAILURE: "security_csrf_failure",
  SECURITY_INJECTION_DETECTED: "security_injection_detected",
  SECURITY_PRIVILEGE_ESCALATION: "security_privilege_escalation",
  SECURITY_UNAUTHORIZED_ACCESS: "security_unauthorized_access",
  SECURITY_DATA_BREACH_ATTEMPT: "security_data_breach_attempt",
  SECURITY_IP_BLOCKED: "security_ip_blocked",
  SECURITY_IP_UNBLOCKED: "security_ip_unblocked",
  IDS_DRY_RUN_WOULD_BLOCK: "ids_dry_run_would_block",
  API_REQUEST: "api_request",
  CONTENT_PASTE: "content_paste",
  LOGIN_ATTEMPT: "login_attempt",
  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILURE: "login_failure",
} as const;
