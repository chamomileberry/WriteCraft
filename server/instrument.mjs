
import * as Sentry from "@sentry/node";
// Profiling integration disabled to reduce memory consumption during startup
// import { nodeProfilingIntegration } from "@sentry/profiling-node";

const sentryDsn = process.env.SENTRY_DSN;

// Sentry initialization runs immediately when this module is imported
Sentry.init({
  dsn: sentryDsn,
  enabled: !!sentryDsn,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Profiling disabled to prevent memory exhaustion during deployment
  // Can be re-enabled with Reserved VM deployment if needed
  integrations: [
    // nodeProfilingIntegration(),
  ],
  // profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  beforeSend(event, hint) {
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data && breadcrumb.data.url) {
          breadcrumb.data.url = breadcrumb.data.url.replace(/([?&])(api_key|token|password|secret)=[^&]*/gi, '$1$2=REDACTED');
        }
        return breadcrumb;
      });
    }

    if (event.request && event.request.headers) {
      const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
      sensitiveHeaders.forEach(header => {
        if (event.request.headers[header]) {
          event.request.headers[header] = 'REDACTED';
        }
      });
    }

    return event;
  },
});

export default Sentry;
