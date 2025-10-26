import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Diagnostic logging for Sentry initialization
const sentryDsn = process.env.SENTRY_DSN;
const isEnabled = !!sentryDsn;

console.log('==========================================');
console.log('Sentry Initialization');
console.log('==========================================');
console.log('SENTRY_DSN present:', !!sentryDsn);
console.log('SENTRY_DSN value:', sentryDsn ? `${sentryDsn.substring(0, 30)}...` : 'NOT SET');
console.log('Sentry enabled:', isEnabled);
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('==========================================');

// Initialize Sentry - must be done before any other imports
Sentry.init({
  dsn: sentryDsn,
  
  // Only enable in production or if DSN is provided
  enabled: isEnabled,
  
  // Environment tracking
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Profiling
  integrations: [
    nodeProfilingIntegration(),
  ],
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Log monitoring
  enableLogs: true,
  
  // User context (includes IP and headers)
  sendDefaultPii: false, // We'll manually set user context for privacy
  
  // Release tracking
  release: process.env.npm_package_version || 'unknown',
  
  // Before send hook to filter out sensitive data
  beforeSend(event, hint) {
    // Filter out any sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        // Remove any potential sensitive data from URLs
        if (breadcrumb.data && breadcrumb.data.url) {
          breadcrumb.data.url = breadcrumb.data.url.replace(/([?&])(api_key|token|password|secret)=[^&]*/gi, '$1$2=REDACTED');
        }
        return breadcrumb;
      });
    }
    
    // Filter sensitive headers
    if (event.request?.headers) {
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
