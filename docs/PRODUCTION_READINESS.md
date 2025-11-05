# WriteCraft Production Readiness Guide

## Overview

This document outlines all critical steps required before deploying WriteCraft to production. Use this as a checklist to ensure a safe, compliant, and reliable launch.

---

## 1. Legal & Compliance ✅

### GDPR/CCPA Data Rights

**Status:** ✅ Implemented

#### Data Export (Right to Access)

- **Endpoint:** `GET /api/export/user-data`
- **Functionality:** Exports all user data as JSON including:
  - Account information
  - All notebook content (70+ content types)
  - Projects, timelines, canvases
  - AI conversation history
  - Subscription and billing data
  - Team memberships
  - Feedback submitted
  - API keys (without secrets)
  - AI usage logs
- **Format:** JSON file download
- **Testing:** Log in as a test user and access the endpoint to verify all data exports correctly

#### Account Deletion (Right to Deletion)

- **Endpoint:** `DELETE /api/users/account`
- **Functionality:**
  - Permanently deletes user account
  - Cascades to all 170+ related database tables automatically
  - Logs deletion for audit purposes
  - Destroys session and logs out user
- **Audit Trail:** Logged via Pino structured logging
- **Testing:** Create a test user, generate content, then delete account and verify all data is removed

#### Cookie Consent

- **Component:** `CookieConsentBanner`
- **Functionality:**
  - Blocks analytics (PostHog) until user accepts
  - Opt-out by default approach
  - Granular controls (Necessary, Analytics, Functional)
  - Persists preferences in localStorage
- **Verification:** Open site in incognito, verify PostHog doesn't track until consent given

---

## 2. Security Configuration

### Content Security Policy (CSP)

**Status:** ✅ Implemented

- Nonce-based CSP headers configured
- Violation reporting endpoint: `/api/csp-report`
- Monitor CSP violations in logs

### Rate Limiting

**Status:** ✅ Implemented

- Redis-backed distributed rate limiting
- General: 2000 requests/15 minutes
- Sensitive operations: 50 requests/window
- Search: 150 requests/15 minutes
- Upload: 50 requests/15 minutes

**Verification:**

```bash
# Test rate limiting
for i in {1..100}; do curl -X GET https://your-app.replit.app/api/health; done
```

### CORS Configuration

**Status:** ✅ Not Required

- App is served from same origin (Vite + Express on same domain)
- No separate frontend/backend domains
- If deploying frontend and backend separately in future:

  ```typescript
  import cors from "cors";

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "https://writecraft.com",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );
  ```

---

## 3. Database & Backup

### PostgreSQL Configuration

**Provider:** Neon Serverless PostgreSQL  
**Connection:** Managed via `DATABASE_URL` environment variable

### Backup Strategy

**Automated Backups:**

- Neon provides automatic daily backups
- Point-in-time recovery (PITR) available
- Retention: 7 days (configurable)

**Verification Steps:**

1. Log into Neon dashboard: https://console.neon.tech
2. Navigate to your project
3. Verify "Backups" section shows recent backups
4. Test restore process:
   ```bash
   # Create a test branch from backup
   # Navigate to Neon Console > Branches > Create Branch
   # Select "From a point in time"
   # Choose a recent backup
   ```

**Manual Backup (Optional):**

```bash
# Export database to SQL file
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Upload to object storage or S3 for safekeeping
```

### Schema Changes

**CRITICAL:** Never manually write SQL migrations

```bash
# Always use Drizzle to push schema changes
npm run db:push

# If data loss warning, force the push after verifying
npm run db:push --force
```

---

## 4. Email Deliverability

### SMTP Configuration

**Provider:** Zoho Mail  
**Environment Variables:**

- `SMTP_HOST`: smtp.zoho.com
- `SMTP_PORT`: 465
- `SMTP_USER`: your-email@domain.com
- `SMTP_PASS`: your-app-password
- `SMTP_FROM`: your-email@domain.com

### DNS Records Required

#### SPF Record

Add to your domain's DNS:

```
Type: TXT
Name: @
Value: v=spf1 include:zoho.com ~all
```

#### DKIM Record

1. Log into Zoho Mail Admin Console
2. Navigate to Email Configuration > Email Delivery > DKIM
3. Copy the DKIM record provided by Zoho
4. Add to DNS:

```
Type: TXT
Name: zoho._domainkey
Value: [DKIM key from Zoho]
```

#### DMARC Record (Optional but Recommended)

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@yourdomain.com
```

### Testing Email Deliverability

1. Send test emails from production:

```bash
# Use the email preview route (admin only)
GET /api/email-preview/subscription-created
```

2. Check email headers to verify SPF/DKIM pass:

   - Gmail: Show original > Look for "SPF: PASS" and "DKIM: PASS"
   - Use mail-tester.com for comprehensive testing

3. Monitor bounce rates in Zoho dashboard

---

## 5. Error Monitoring & Alerts

### Sentry Configuration

**Status:** ✅ Implemented  
**DSN:** Configured via `SENTRY_DSN` environment variable

### Alert Rules Setup

1. Log into Sentry: https://sentry.io
2. Navigate to Alerts > Create Alert Rule
3. Configure critical alerts:

#### High Error Rate Alert

```
Conditions:
- When error count >= 10 in 5 minutes
- Environment: production
- Tags: level=error

Actions:
- Send notification to Slack/Email
- Create incident
```

#### Performance Degradation Alert

```
Conditions:
- When p95(transaction.duration) > 2000ms
- Over 5 minutes
- Environment: production

Actions:
- Send notification to Slack/Email
```

#### Database Error Alert

```
Conditions:
- When error message contains "database"
- Count >= 5 in 5 minutes

Actions:
- Send notification (URGENT)
- Page on-call engineer
```

### Sentry Dashboard

- Review errors daily
- Set up weekly error digest email
- Monitor release health metrics

---

## 6. Analytics & Monitoring

### PostHog Configuration

**Status:** ✅ Implemented  
**Environment Variables:**

- `VITE_POSTHOG_API_KEY`
- `VITE_POSTHOG_HOST`

**GDPR Compliance:** ✅ Consent-gated, opt-out by default

**Key Metrics to Monitor:**

- Daily active users (DAU)
- Feature usage (generators, AI chat, etc.)
- Conversion funnel (signup → onboarding → first content created)
- Subscription upgrades
- Churn rate

### Health Check Endpoints

**Status:** ✅ Implemented

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status with database connection

**Uptime Monitoring:**
Use external service like UptimeRobot:

1. Monitor `/api/health` endpoint every 5 minutes
2. Alert if down for 2+ consecutive checks
3. Check from multiple geographic locations

---

## 7. Performance & Load Testing

### Load Testing Script

Create `scripts/load-test.js`:

```javascript
// Install: npm install -g artillery
// Run: artillery run load-test.yml

// load-test.yml
config:
  target: 'https://your-app.replit.app'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 users per second
      name: "Warm up"
    - duration: 300
      arrivalRate: 50  # 50 users per second
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100  # 100 users per second
      name: "Spike test"
  http:
    timeout: 30
scenarios:
  - name: "User browsing"
    flow:
      - get:
          url: "/api/health"
      - think: 2
      - get:
          url: "/api/notebooks"
          headers:
            Cookie: "connect.sid=..."  # Add test user session
      - think: 3
      - get:
          url: "/api/characters?notebookId={{notebookId}}"
```

### Performance Baselines

After running load test, establish baselines:

- **Response Time p50:** < 200ms
- **Response Time p95:** < 1000ms
- **Response Time p99:** < 2000ms
- **Error Rate:** < 0.1%
- **Database Connection Pool:** Monitor usage, ensure not maxed out

### Monitoring During Load Test

```bash
# Watch server logs
npm run dev

# Monitor database connections (in separate terminal)
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Monitor Redis (if using)
redis-cli INFO stats
```

---

## 8. Deployment & Rollback Procedures

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No critical Sentry errors in staging
- [ ] Database migrations tested (use `npm run db:push --force`)
- [ ] Environment variables configured
- [ ] Backup created before deployment
- [ ] Rollback plan ready

### Deployment Steps

1. **Create checkpoint:**

   - Replit automatically creates checkpoints
   - Manual checkpoint: Use Replit UI > History > Create Checkpoint

2. **Deploy new code:**

   ```bash
   git pull origin main
   npm install  # Install new dependencies
   npm run db:push  # Apply schema changes
   npm run dev  # Restart application
   ```

3. **Verify deployment:**
   - Check `/api/health/detailed` returns 200
   - Check Sentry for new errors
   - Monitor logs for first 5-10 minutes
   - Test critical user flows manually

### Rollback Procedure

If issues detected post-deployment:

**Option 1: Replit Checkpoint Rollback (Fastest)**

1. Navigate to Replit > History tab
2. Find last known good checkpoint (before deployment)
3. Click "Restore" on that checkpoint
4. Database and code roll back together

**Option 2: Git Rollback**

```bash
# Find last good commit
git log --oneline

# Rollback to that commit
git revert <commit-hash>

# Restart application
npm run dev
```

**Option 3: Database-Only Rollback**

- Use Neon console to restore from point-in-time backup
- Keep application code as-is

**Post-Rollback:**

1. Verify application is stable
2. Document what went wrong in incident report
3. Fix issue in separate branch
4. Re-test before attempting deployment again

---

## 9. Environment Variables Checklist

### Required for Production

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SENTRY_DSN` - Sentry error tracking
- [ ] `VITE_POSTHOG_API_KEY` - PostHog analytics
- [ ] `VITE_POSTHOG_HOST` - PostHog host URL
- [ ] `ANTHROPIC_API_KEY` - Claude AI API key
- [ ] `STRIPE_SECRET_KEY` - Stripe payments
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook verification
- [ ] `SMTP_HOST` - Email server (Zoho)
- [ ] `SMTP_PORT` - Email port (465)
- [ ] `SMTP_USER` - Email username
- [ ] `SMTP_PASS` - Email password
- [ ] `SMTP_FROM` - From email address
- [ ] `SESSION_SECRET` - Session encryption key
- [ ] `REDIS_URL` - Redis connection (rate limiting)

### Verification

```bash
# Check all required env vars are set
node scripts/check-env.js
```

Create `scripts/check-env.js`:

```javascript
const required = [
  "DATABASE_URL",
  "SENTRY_DSN",
  "VITE_POSTHOG_API_KEY",
  "ANTHROPIC_API_KEY",
  "STRIPE_SECRET_KEY",
  "SMTP_HOST",
  "SESSION_SECRET",
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("Missing required environment variables:");
  missing.forEach((key) => console.error(`  - ${key}`));
  process.exit(1);
} else {
  console.log("✅ All required environment variables are set");
}
```

---

## 10. Pre-Launch Final Checklist

### Legal & Compliance

- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published and accessible
- [ ] Cookie consent banner shows on first visit
- [ ] Data export endpoint tested and working
- [ ] Account deletion endpoint tested and working
- [ ] PostHog only tracks after consent

### Security

- [ ] Rate limiting enabled and tested
- [ ] CSP headers configured
- [ ] MFA available for admin accounts
- [ ] API keys rotated and secured
- [ ] Session timeout configured (max 3 concurrent sessions)
- [ ] HTTPS enforced

### Database & Infrastructure

- [ ] Database backups verified in Neon dashboard
- [ ] Test restore performed successfully
- [ ] Database indexes reviewed (67 indexes present)
- [ ] Connection pooling configured
- [ ] Redis configured and connected

### Email & Communications

- [ ] SPF record added to DNS
- [ ] DKIM record added to DNS
- [ ] Test email sent and received successfully
- [ ] Email deliverability verified (SPF/DKIM pass)
- [ ] Transactional emails tested:
  - [ ] Subscription confirmation
  - [ ] Payment receipt
  - [ ] Password reset
  - [ ] Team invitation

### Monitoring & Alerts

- [ ] Sentry alerts configured
- [ ] Sentry receiving errors correctly
- [ ] PostHog analytics collecting data
- [ ] Health check endpoint responding
- [ ] Uptime monitoring configured (external service)
- [ ] Error rate dashboard created

### Performance

- [ ] Load test executed (100 concurrent users)
- [ ] Performance baselines documented
- [ ] No critical performance issues identified
- [ ] Database query performance reviewed
- [ ] Frontend bundle size optimized

### Error Handling

- [ ] Error boundary wraps app (catches React crashes)
- [ ] All API endpoints return appropriate error codes
- [ ] Error messages don't leak sensitive information
- [ ] Logging captures context for debugging

### Deployment

- [ ] Rollback procedure documented and tested
- [ ] All environment variables configured
- [ ] Dependencies installed and locked (package-lock.json)
- [ ] Checkpoint created before deployment
- [ ] Deployment verification steps documented

### User Experience

- [ ] Onboarding flow tested
- [ ] Critical user flows tested:
  - [ ] Sign up / Login
  - [ ] Create character
  - [ ] Generate content with AI
  - [ ] Create project
  - [ ] Subscription upgrade
  - [ ] Team management
- [ ] Mobile responsiveness verified
- [ ] Loading states consistent
- [ ] Error states user-friendly

### Post-Launch Monitoring (First 48 Hours)

- [ ] Monitor error rates in Sentry (check hourly)
- [ ] Monitor server logs for anomalies
- [ ] Check database performance metrics
- [ ] Monitor user signups and activations
- [ ] Watch for email delivery failures
- [ ] Check payment processing (Stripe dashboard)
- [ ] Monitor AI usage and quota limits
- [ ] Review customer feedback/support tickets

---

## Emergency Contacts

### Critical Issues

- **Database down:** Contact Neon support
- **Email not sending:** Check Zoho status page
- **Payment issues:** Stripe dashboard + support
- **High error rate:** Check Sentry, execute rollback if needed

### Escalation Path

1. Check logs and Sentry for root cause
2. If critical user-facing issue: Execute rollback immediately
3. If degraded performance: Monitor for 10 minutes, rollback if worsening
4. Document incident in post-mortem

---

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Sentry Documentation](https://docs.sentry.io)
- [Stripe Testing Guide](./STRIPE_TESTING_GUIDE.md)
- [Security Audit Report](./SECURITY_AUDIT.md)

---

**Last Updated:** October 28, 2025  
**Review Schedule:** Quarterly or before major releases
