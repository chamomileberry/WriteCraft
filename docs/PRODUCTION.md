# WriteCraft Production Deployment Guide

## Overview

This document outlines the production deployment configuration, monitoring, security, and operational procedures for WriteCraft.

## Environment Variables

### Required Production Secrets

These must be configured in your deployment environment:

```bash
# Core Application
NODE_ENV=production
PORT=5000
DATABASE_URL=<neon-postgres-connection-string>
SESSION_SECRET=<random-64-char-string>

# Authentication & Security
MFA_ENCRYPTION_KEY=<random-32-char-string>

# AI Services
ANTHROPIC_API_KEY=<your-anthropic-api-key>

# Payment Processing
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>

# Error Tracking
SENTRY_DSN=<your-sentry-dsn>

# Optional: Redis for distributed sessions
REDIS_URL=<your-redis-url>  # Falls back to PostgreSQL if not provided

# Optional: Node.js Memory Configuration
# Default heap size is ~512MB, increase to 1GB if deployment fails with OOM errors
NODE_OPTIONS=--max-old-space-size=1024
```

### Memory Configuration

WriteCraft is configured with increased Node.js heap memory to prevent out-of-memory errors during deployment.

**Default Configuration**: 1GB heap size (`NODE_OPTIONS=--max-old-space-size=1024`)

This is set in `dev.sh` and should also be configured in your deployment environment variables.

**When to increase memory**:

- If you see "JavaScript heap out of memory" errors during startup
- If you re-enable Sentry profiling integration
- If you upgrade to a Reserved VM deployment (can support larger heap sizes)

**Troubleshooting deployment memory issues**:

1. Sentry profiling is already disabled by default (see `server/instrument.mjs`)
2. NODE_OPTIONS is set to 1GB in dev.sh
3. If still failing, increase to `--max-old-space-size=2048` (2GB)
4. Consider upgrading to Reserved VM for better resource allocation

### Security Configuration

WriteCraft automatically enables enhanced security features in production:

#### Enabled Automatically in Production (NODE_ENV=production):

- ✅ **Intrusion Detection System (IDS)**: Monitors and blocks malicious requests
- ✅ **IP Blacklisting**: Blocks known malicious IP addresses
- ✅ **SQL Injection Detection**: Scans all inputs for SQL injection patterns
- ✅ **Rate Limiting**: 1,000 requests per 15 minutes (10,000 in development)
- ✅ **Input Sanitization**: Strips dangerous HTML/scripts from all inputs
- ✅ **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- ✅ **CSRF Protection**: Token-based CSRF protection on state-changing endpoints
- ✅ **Row-Level Security**: Database-level access control

#### Development vs Production Differences:

| Feature               | Development  | Production  |
| --------------------- | ------------ | ----------- |
| IDS                   | Disabled     | ✅ Active   |
| IP Blocking           | Disabled     | ✅ Active   |
| Injection Detection   | Disabled     | ✅ Active   |
| Rate Limit            | 10,000/15min | 1,000/15min |
| Sentry Error Tracking | Sample 100%  | Sample 10%  |
| Performance Profiling | Sample 100%  | Sample 10%  |

## Error Tracking & Monitoring

### Sentry Configuration

Sentry is integrated for comprehensive error tracking and performance monitoring.

#### Setup Steps:

1. Create a Sentry account at https://sentry.io
2. Create a new project (select "Node.js/Express")
3. Copy your DSN from project settings
4. Set `SENTRY_DSN` environment variable
5. Deploy application - errors will automatically flow to Sentry
6. **Test your setup**: Visit `https://your-app.replit.app/api/sentry/test-capture` to send a test event

#### Features Enabled:

- **Error Capture**: All uncaught exceptions and rejections
- **Performance Monitoring**: 10% sample rate in production (100% in development)
- **Profiling**: ⚠️ DISABLED to reduce memory consumption during deployment
  - Profiling can be re-enabled if you upgrade to a Reserved VM deployment
  - See `server/instrument.mjs` to enable profiling integration
- **User Context**: Errors tagged with user IDs (privacy-safe)
- **Release Tracking**: Errors grouped by app version
- **Sensitive Data Filtering**: API keys, tokens, passwords automatically redacted

#### Test Endpoints (Public):

These endpoints are publicly accessible for Sentry setup testing:

- `/api/sentry/check-config` - Verify Sentry DSN configuration
- `/api/sentry/test-capture` - Manually capture a test event (returns event ID)
- `/api/sentry/debug` - Trigger a test error (returns 500)

#### Using Sentry in Code:

```typescript
import {
  captureSentryException,
  captureSentryMessage,
} from "./lib/sentryHelpers";

// Capture exceptions with context
try {
  await riskyOperation();
} catch (error) {
  captureSentryException(error, {
    operation: "AI_GENERATION",
    userId: user.id,
    modelUsed: "haiku",
  });
  throw error;
}

// Capture important events
captureSentryMessage("Large AI request detected", "warning", {
  tokenCount: 50000,
  userId: user.id,
});
```

### Uptime Monitoring

**Recommended Service**: UptimeRobot (Free tier: 50 monitors, 5-minute checks)

#### Setup Steps:

1. Create account at https://uptimerobot.com
2. Add monitors for:
   - Main app: `https://your-app.replit.app` (HTTP)
   - Health endpoint: `https://your-app.replit.app/api/health` (HTTP, expect 200)
   - Database connectivity: `https://your-app.replit.app/api/health/db` (HTTP, expect 200)
3. Configure alerts:
   - Email alerts to ops team
   - Webhook to Slack/Discord (optional)
   - Alert after 2 consecutive failures (10 minutes of downtime)

#### Health Check Endpoints:

```bash
# Basic health
GET /api/health
Response: { "status": "ok", "timestamp": "2025-10-26T12:00:00Z" }

# Database health
GET /api/health/db
Response: { "status": "ok", "database": "connected" }

# Detailed status (authenticated admin only)
GET /api/health/detailed
Response: {
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "uptime": 86400,
  "version": "1.0.0"
}
```

## Database Configuration

### Neon PostgreSQL (Production Database)

#### Connection Pooling:

WriteCraft uses Neon's serverless driver (`@neondatabase/serverless`) with optimized pooling:

```typescript
// Default configuration (server/db.ts)
const pool = neon(DATABASE_URL, {
  poolQueryViaFetch: true, // Use fetch for better performance
  fetchConnectionCache: true, // Cache connections
});
```

#### Recommended Neon Settings:

- **Compute Size**: Scale tier based on traffic (Start with 0.25 CU, scale to 2 CU for production)
- **Auto-suspend**: 5 minutes of inactivity
- **Connection Pooling**: Always enabled
- **Point-in-Time Recovery (PITR)**: Enabled with 7-day retention minimum

### Backup Strategy

#### Automatic Backups (Neon):

- **Frequency**: Continuous WAL archiving
- **Retention**: 7 days (configurable up to 30 days)
- **Point-in-Time Recovery**: Restore to any point in time within retention window

#### Manual Backup Procedures:

```bash
# Database export (using pg_dump via Neon console or CLI)
# 1. Access Neon console: https://console.neon.tech
# 2. Select your project
# 3. Go to "Operations" > "Backups"
# 4. Click "Download backup" for manual export

# Restore from backup:
# 1. Create new branch in Neon
# 2. Test restore on branch
# 3. Promote branch to main if verified
```

#### Application Data Exports:

- User-initiated exports available through UI (characters, notebooks, projects)
- Admin exports for full database dumps
- Object storage backups for uploaded files (GCS versioning enabled)

## Performance Optimization

### Database Indexes

All critical queries are indexed. Current indexes:

- User lookups: `users.id`, `users.email`
- Session management: `sessions.sid`, `sessions.expire`
- AI usage tracking: `ai_usage_logs.userId`, `ai_usage_logs.createdAt`
- Content queries: Composite indexes on `projectId + userId`, `notebookId + userId`
- Full-text search: GIN indexes on `tsvector` columns

### Caching Strategy

- **Entity Detection Cache**: In-memory cache with 10-minute TTL, user+message hash keys
- **Session Store**: Redis (if available) or PostgreSQL with automatic cleanup
- **Static Assets**: CDN recommended (Cloudflare, Fastly)

### CDN Setup (Recommended)

#### Cloudflare (Free Tier):

1. Add your domain to Cloudflare
2. Update DNS to point to Cloudflare nameservers
3. Enable "Proxy" (orange cloud) for your domain
4. Configure cache rules:
   - Cache static assets: `/assets/*`, `/images/*`
   - Cache time: 1 month for versioned assets
   - Bypass cache: `/api/*`, `/auth/*`

#### Without CDN:

Static assets are served with cache headers:

```
Cache-Control: public, max-age=31536000, immutable
```

## Load Testing

### Tools

- **autocannon**: Installed for HTTP load testing
- **k6**: Alternative for complex scenarios (optional)

### Running Load Tests

#### Install autocannon:

```bash
npm install -g autocannon
```

#### Test AI Chat Endpoint:

```bash
# Low traffic (50 concurrent, 30 seconds)
autocannon -c 50 -d 30 \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -m POST \
  -H "Content-Type: application/json" \
  -b '{"message":"Test message","projectId":"test-project"}' \
  https://your-app.replit.app/api/ai/chat

# High traffic (200 concurrent, 60 seconds)
autocannon -c 200 -d 60 \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -m POST \
  -H "Content-Type: application/json" \
  -b '{"message":"Test","projectId":"test"}' \
  https://your-app.replit.app/api/ai/chat
```

#### Test Character Generation:

```bash
autocannon -c 100 -d 30 \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE" \
  -m POST \
  -H "Content-Type: application/json" \
  -b '{"name":"Test Character","genre":"Fantasy"}' \
  https://your-app.replit.app/api/generators/character
```

#### Baseline Performance Targets:

- **p50 latency**: < 200ms (API endpoints)
- **p95 latency**: < 1000ms (API endpoints)
- **p99 latency**: < 3000ms (AI generation endpoints)
- **Error rate**: < 0.1% under normal load
- **Throughput**: 500+ req/sec on standard endpoints

## Feature Flags

### Configuration

Feature flags allow gradual rollout of new features and emergency kill switches.

#### Database Schema:

```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY,
  flag_key VARCHAR(255) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  tier_restriction VARCHAR(50), -- 'free', 'author', 'professional', 'team', null for all
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Usage in Code:

```typescript
// Server-side
import { isFeatureEnabled } from './lib/featureFlags';

if (await isFeatureEnabled('extended_thinking', user.subscription.tier)) {
  // Enable extended thinking
}

// Client-side
const { isEnabled } = useFeatureFlag('new_editor_ui');
if (isEnabled) {
  return <NewEditorUI />;
}
```

### Current Feature Flags:

- `extended_thinking`: Extended AI reasoning (Professional/Team only)
- `polish_feature`: AI Polish feature (Professional/Team only)
- `canvas_mode`: Canvas whiteboard (All tiers)
- `team_collaboration`: Team features (Team tier only)

## Incident Response

### Error Severity Levels

| Level             | Response Time     | Examples                                        |
| ----------------- | ----------------- | ----------------------------------------------- |
| **P0 - Critical** | 15 minutes        | Database down, auth broken, data loss           |
| **P1 - High**     | 1 hour            | AI endpoints failing, payment processing broken |
| **P2 - Medium**   | 4 hours           | Feature degradation, non-critical errors        |
| **P3 - Low**      | Next business day | UI bugs, minor issues                           |

### Incident Response Procedures

#### P0 - Critical Outage:

1. **Immediate**:

   - Check Sentry for error spike
   - Check UptimeRobot alerts
   - Verify database connectivity: `psql $DATABASE_URL -c "SELECT 1"`
   - Check Replit deployment status

2. **Diagnosis** (5 minutes):

   - Review recent deployments (last 2 hours)
   - Check error logs in Sentry
   - Verify environment variables are set
   - Check Neon database status

3. **Mitigation** (10 minutes):

   - If recent deployment caused issue: Rollback via Replit deployments
   - If database issue: Check Neon status, restart if needed
   - If API key issue: Rotate keys via admin panel
   - If DDoS: Enable Cloudflare DDoS protection

4. **Communication**:
   - Post status update (within 30 minutes)
   - Notify affected users (if data loss)
   - Document incident in postmortem

#### P1 - High Priority:

1. **Initial Response** (15 minutes):

   - Identify affected feature from Sentry tags
   - Check recent code changes to that feature
   - Review error frequency and user impact

2. **Investigation** (30 minutes):

   - Reproduce issue in staging if possible
   - Check for API quota limits (Anthropic, Stripe)
   - Review feature flag status

3. **Resolution** (1 hour):
   - Deploy hotfix if code issue
   - Disable feature flag if unstable
   - Increase rate limits if throttling
   - Scale database compute if performance issue

### Rollback Procedures

#### Code Rollback (Replit):

```bash
# Via Replit UI:
# 1. Go to deployments page
# 2. Find last known good deployment
# 3. Click "Redeploy"

# Via Replit CLI (if available):
replit deploy --rollback
```

#### Database Rollback (Neon):

```bash
# Point-in-Time Recovery:
# 1. Go to Neon console
# 2. Select "Restore" tab
# 3. Choose timestamp (up to 7 days ago)
# 4. Create restore branch
# 5. Test on branch
# 6. Promote to main if verified

# CAUTION: This will lose all data after the restore point
```

#### Feature Flag Kill Switch:

```sql
-- Disable feature immediately
UPDATE feature_flags SET enabled = false WHERE flag_key = 'problematic_feature';
```

### Escalation Contacts

| Role             | Contact       | Escalation Level   |
| ---------------- | ------------- | ------------------ |
| On-Call Engineer | [Email/Phone] | First response     |
| Tech Lead        | [Email/Phone] | P0/P1 incidents    |
| Database Admin   | [Email/Phone] | Database issues    |
| Security Team    | [Email/Phone] | Security incidents |

## Deployment Checklist

### Pre-Deployment:

- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] Feature flags configured
- [ ] Sentry release created
- [ ] Backup recent database state

### During Deployment:

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor error rates in Sentry
- [ ] Check performance metrics
- [ ] Verify feature flags working

### Post-Deployment:

- [ ] Monitor for 30 minutes
- [ ] Check error rates < 0.1%
- [ ] Verify critical user flows work
- [ ] Update status page
- [ ] Document changes in changelog

## Monitoring Dashboard Links

- **Sentry**: https://sentry.io/organizations/[your-org]/projects/writecraft/
- **UptimeRobot**: https://uptimerobot.com/dashboard
- **Neon Console**: https://console.neon.tech
- **Replit Deployments**: https://replit.com/[your-username]/[your-repl]/deployments
- **Stripe Dashboard**: https://dashboard.stripe.com

## Performance Metrics

### Key Metrics to Monitor:

1. **Error Rate**: < 0.1% (Sentry)
2. **Response Time**: p95 < 1s (Sentry Performance)
3. **Database Connections**: < 80% of pool (Neon Console)
4. **AI Token Usage**: Track daily limits (Usage Dashboard)
5. **Uptime**: > 99.9% (UptimeRobot)

### Alerts to Configure:

- Error rate > 1% for 5 minutes
- p95 response time > 3s for 10 minutes
- Database connections > 90%
- Uptime check fails 2x in a row
- AI usage > 90% of tier limit

## Security Checklist

### Regular Security Tasks:

- [ ] Review Sentry security alerts weekly
- [ ] Rotate API keys quarterly
- [ ] Review user access logs monthly
- [ ] Update dependencies monthly
- [ ] Security audit quarterly
- [ ] Penetration testing annually

### Immediate Response (Security Incident):

1. Identify scope of breach
2. Disable compromised credentials
3. Force password reset for affected users
4. Notify users within 72 hours
5. Document incident and response
6. Implement additional safeguards

---

## Additional Resources

- [Replit Deployment Docs](https://docs.replit.com/hosting/deployments)
- [Neon Documentation](https://neon.tech/docs/)
- [Sentry Node.js Guide](https://docs.sentry.io/platforms/node/)
- [Stripe Production Checklist](https://stripe.com/docs/development/checklist)
