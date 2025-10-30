import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { billingAlertsService } from '../services/billingAlertsService';
import { readRateLimiter, writeRateLimiter } from '../security/rateLimiters';

const router = Router();

/**
 * Get all billing alerts for the authenticated user
 */
router.get('/', isAuthenticated, readRateLimiter, async (req: any, res, next) => {
  try {
    const userId = req.user.claims.sub;
    const status = req.query.status as string | undefined;
    
    const alerts = await billingAlertsService.getUserAlerts(userId, status);
    
    res.json({ alerts });
  } catch (error) {
    next(error);
  }
});

/**
 * Get unread alert count
 */
router.get('/unread-count', isAuthenticated, readRateLimiter, async (req: any, res, next) => {
  try {
    const userId = req.user.claims.sub;
    
    const count = await billingAlertsService.getUnreadCount(userId);
    
    res.json({ count });
  } catch (error) {
    next(error);
  }
});

/**
 * Mark an alert as read
 */
router.patch('/:id/read', isAuthenticated, writeRateLimiter, async (req: any, res, next) => {
  try {
    const userId = req.user.claims.sub;
    const alertId = req.params.id;
    
    const alert = await billingAlertsService.markAsRead(alertId, userId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ alert });
  } catch (error) {
    next(error);
  }
});

/**
 * Dismiss an alert
 */
router.patch('/:id/dismiss', isAuthenticated, writeRateLimiter, async (req: any, res, next) => {
  try {
    const userId = req.user.claims.sub;
    const alertId = req.params.id;
    
    const alert = await billingAlertsService.dismissAlert(alertId, userId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ alert });
  } catch (error) {
    next(error);
  }
});

/**
 * Resolve an alert
 */
router.patch('/:id/resolve', isAuthenticated, writeRateLimiter, async (req: any, res, next) => {
  try {
    const userId = req.user.claims.sub;
    const alertId = req.params.id;
    
    const alert = await billingAlertsService.resolveAlert(alertId, userId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ alert });
  } catch (error) {
    next(error);
  }
});

export default router;
