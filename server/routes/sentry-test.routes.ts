import { Router } from 'express';
import * as Sentry from '@sentry/node';

const router = Router();

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
