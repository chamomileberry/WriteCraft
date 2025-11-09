import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const sentryDsn = getEnvOptional('SENTRY_DSN');

Sentry.init({
  dsn: sentryDsn,
  enabled: !!sentryDsn,
  environment: getEnvOptional('NODE_ENV') || "development",
  tracesSampleRate: getEnvOptional('NODE_ENV') === "production" ? 0.1 : 1.0,
  integrations: [nodeProfilingIntegration()],
  profilesSampleRate: getEnvOptional('NODE_ENV') === "production" ? 0.1 : 1.0,

  beforeSend(event, hint) {
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.data && breadcrumb.data.url) {
          breadcrumb.data.url = breadcrumb.data.url.replace(
            /([?&])(api_key|token|password|secret)=[^&]*/gi,
            "$1$2=REDACTED",
          );
        }
        return breadcrumb;
      });
    }

    if (event.request?.headers) {
      const sensitiveHeaders = ["authorization", "cookie", "x-api-key"];
      sensitiveHeaders.forEach((header) => {
        if (event.request!.headers![header]) {
          event.request!.headers![header] = "REDACTED";
        }
      });
    }

    return event;
  },
});

export default Sentry;
