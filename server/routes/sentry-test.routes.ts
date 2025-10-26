import { Router } from 'express';
import * as Sentry from '@sentry/node';

const router = Router();

// Diagnostic endpoint to check Sentry configuration
router.get('/check-config', (req, res) => {
  const sentryDsn = process.env.SENTRY_DSN;
  const isEnabled = !!sentryDsn;
  
  res.json({
    sentryConfigured: isEnabled,
    dsnPresent: isEnabled,
    dsnPreview: sentryDsn ? `${sentryDsn.substring(0, 30)}...` : 'NOT SET',
    environment: process.env.NODE_ENV || 'development',
    message: isEnabled 
      ? 'Sentry DSN is configured and Sentry should be active'
      : 'SENTRY_DSN environment variable is not set. Please add it to Replit Secrets.',
    instructions: !isEnabled 
      ? 'Go to Replit Secrets and add SENTRY_DSN with your Sentry DSN value, then restart the server.'
      : 'Configuration looks good. Try the /debug-sentry endpoint to test error tracking.'
  });
});

// Official Sentry test endpoint (recommended by Sentry docs)
// Use /api/sentry/debug to avoid client-side router interception
router.get('/debug', function mainHandler(req, res) {
  console.log('[Sentry Test] /api/sentry/debug endpoint triggered - throwing error');
  throw new Error('My first Sentry error!');
});

// Legacy endpoint for backward compatibility
router.get('/debug-sentry', function mainHandler(req, res) {
  console.log('[Sentry Test] /api/sentry/debug-sentry endpoint triggered - throwing error');
  throw new Error('My first Sentry error!');
});

// Test endpoint that throws an error to verify Sentry error capture
router.get('/test-sentry-error', (req, res) => {
  console.log('[Sentry Test] Triggering test error...');
  
  // Capture a message first
  Sentry.captureMessage('Sentry test endpoint accessed', 'info');
  
  // Then throw an error
  throw new Error('This is a test error from WriteCraft to verify Sentry integration is working!');
});

// Test endpoint that captures a message (doesn't throw an error)
router.get('/test-sentry-message', (req, res) => {
  console.log('[Sentry Test] Sending test message to Sentry...');
  
  const eventId = Sentry.captureMessage('Sentry message test - integration is working!', 'info');
  
  res.json({
    success: true,
    message: 'Test message sent to Sentry',
    eventId,
    instructions: 'Check your Sentry dashboard at https://writecraft.sentry.io to see this event'
  });
});

export default router;
