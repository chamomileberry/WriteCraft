# IDS Testing & Configuration Guide

## Overview

The Intrusion Detection System (IDS) now includes robust testing features to prevent false positives in production. This guide explains how to safely test and configure IDS before deploying with IP blocking enabled.

## Quick Start

### Current Status (After Oct 27, 2025 Updates)

- **Auto-blocking**: DISABLED by default (opt-in to prevent false positives)
- **Manual blocking**: Always works (admins can block IPs anytime)
- **Dry run mode**: Available for safe testing
- **IP whitelist**: Fully functional with CIDR support
- **Analytics**: Server-side PostHog tracking enabled

### Three Deployment Modes

1. **Disabled** (Default - Production Safe)

   - No environment variables needed
   - Manual IP blocks work
   - Auto-blocking disabled

   ```bash
   # No IDS variables set = safe default
   ```

2. **Dry Run** (Testing Mode)

   - Tracks and logs violations
   - Shows what WOULD be blocked
   - Doesn't actually block anyone
   - Perfect for establishing baselines

   ```bash
   ENABLE_IDS_DRY_RUN=true
   ```

3. **Enabled** (Active Protection)
   - Auto-blocks malicious IPs
   - Should only enable after dry run testing
   ```bash
   ENABLE_IDS=true
   ```

## Testing Workflow

### Step 1: Enable Analytics (Required)

Set server-side PostHog variables for security event tracking:

```bash
POSTHOG_API_KEY=your_posthog_api_key
POSTHOG_HOST=https://app.posthog.com
```

**Note**: The system also checks `VITE_POSTHOG_API_KEY` and `VITE_POSTHOG_HOST` as fallbacks, but `POSTHOG_*` vars are recommended for server-side tracking.

### Step 2: Run in Dry Run Mode (1-2 weeks)

Enable dry run mode to collect data without blocking users:

```bash
ENABLE_IDS_DRY_RUN=true
```

**What happens:**

- All security events are logged to console
- Events are sent to PostHog for analysis
- "Would block" alerts appear in Security Dashboard
- NO actual IP blocking occurs

### Step 3: Analyze Baseline Metrics

After 1-2 weeks, review PostHog data to establish normal usage patterns:

**Key Metrics to Check:**

1. **Failed Login Attempts**

   - Event: `security_auth_failure`
   - Look at: p50, p95, p99 per user
   - Typical: 1-3 failed logins per session

2. **API Call Volume**

   - Event: `api_request`
   - Look at: Requests per minute per user
   - Typical: 10-50 req/min for active users

3. **Content Paste Events**

   - Event: `content_paste`
   - Look at: Does pasted content trigger false injection warnings?
   - Common issue: Word docs with special characters

4. **Would-Be Blocks**
   - Event: `ids_dry_run_would_block`
   - CRITICAL: Review every one of these
   - If you see legitimate users, tune thresholds

### Step 4: Tune Thresholds (Optional)

If dry run shows false positives, adjust thresholds:

```bash
# Brute Force Detection
IDS_BRUTE_FORCE_THRESHOLD=5        # Failed logins (default: 5)
IDS_BRUTE_FORCE_WINDOW_MIN=15      # Time window in minutes (default: 15)
IDS_BRUTE_FORCE_BLOCK_MIN=240      # Block duration in minutes (default: 240 = 4 hours)

# Rate Limiting Detection
IDS_RATE_LIMIT_THRESHOLD=10        # Violations (default: 10)
IDS_RATE_LIMIT_WINDOW_MIN=15       # Time window (default: 15)
IDS_RATE_LIMIT_BLOCK_MIN=120       # Block duration (default: 120 = 2 hours)

# Injection Attack Detection
IDS_INJECTION_THRESHOLD=3          # Injection attempts (default: 3)
IDS_INJECTION_WINDOW_MIN=60        # Time window (default: 60)
IDS_INJECTION_BLOCK_MIN=1440       # Block duration (default: 1440 = 24 hours)
```

**Recommended Adjustments:**

- Creative writing platform: Increase `IDS_INJECTION_THRESHOLD` to 5-10 (users paste content with special characters)
- High-traffic apps: Increase `IDS_RATE_LIMIT_THRESHOLD` to 20-30
- Password reset heavy: Increase `IDS_BRUTE_FORCE_THRESHOLD` to 8-10

### Step 5: Set Up IP Whitelist

Whitelist known-good IPs before enabling auto-blocking:

```typescript
// Via admin UI (to be built) or direct DB insert
await IntrusionDetectionService.whitelistIp({
  ipAddress: "1.2.3.4", // Single IP
  description: "Office network",
  addedBy: adminUserId,
  expiresAt: null, // Permanent
});

// Whitelist CIDR range
await IntrusionDetectionService.whitelistIp({
  ipAddress: "10.0.0.0/24", // /24 subnet
  description: "Corporate VPN",
  addedBy: adminUserId,
});
```

**Who to whitelist:**

- Your own IP addresses
- Known corporate networks
- Testing/monitoring services
- Your own IPs (via Security Dashboard)

### Step 6: Enable Auto-Blocking

Once confident, enable IDS:

```bash
ENABLE_IDS=true
```

**What happens:**

- Automatic IP blocking activates
- Threshold violations trigger blocks
- Manual blocks continue working
- Whitelisted IPs are never blocked

### Step 7: Monitor Closely (First 48 Hours)

**Watch for:**

- False positive blocks
- Legitimate users getting blocked
- Unusual patterns

**Quick Disable:**

```bash
# Emergency disable (stops auto-blocking)
ENABLE_IDS=false

# Or switch back to dry run
ENABLE_IDS_DRY_RUN=true
```

## IP Whitelist Management

### CIDR Support

The whitelist supports:

- Single IPs: `192.168.1.1`
- /24 subnets: `192.168.1.0/24` (256 IPs)
- /16 subnets: `192.168.0.0/16` (65,536 IPs)

### Backend API

```typescript
// Check if IP is whitelisted
const isWhitelisted =
  await IntrusionDetectionService.isIpWhitelisted("1.2.3.4");

// Add to whitelist
await IntrusionDetectionService.whitelistIp({
  ipAddress: "1.2.3.4",
  description: "Reason for whitelisting",
  addedBy: userId,
  expiresAt: new Date("2025-12-31"), // Optional expiration
});

// Remove from whitelist
await IntrusionDetectionService.removeFromWhitelist("1.2.3.4");

// Get all whitelisted IPs
const whitelist = await IntrusionDetectionService.getWhitelistedIps();
```

## PostHog Event Reference

### Security Events Tracked

| Event Name                    | When Fired           | Properties                          |
| ----------------------------- | -------------------- | ----------------------------------- |
| `security_auth_failure`       | Failed login         | `ipAddress`, `userId`, `method`     |
| `security_rate_limit`         | Rate limit exceeded  | `endpoint`, `ipAddress`             |
| `security_injection_detected` | SQL/XSS detected     | `type`, `payload` (sanitized)       |
| `security_ip_blocked`         | IP auto-blocked      | `ipAddress`, `reason`, `duration`   |
| `security_ip_unblocked`       | IP unblocked         | `ipAddress`, `unblockedBy`          |
| `ids_dry_run_would_block`     | Dry run: would block | `ipAddress`, `reason`, `duration`   |
| `api_request`                 | API call made        | `method`, `path`, `authenticated`   |
| `content_paste`               | Content pasted       | `contentLength`, `triggerDetection` |
| `login_attempt`               | Login attempt        | `success`, `method`                 |

### Querying PostHog

**Example: Failed login distribution**

```sql
SELECT
  properties.ipAddress,
  COUNT(*) as attempts
FROM events
WHERE event = 'security_auth_failure'
  AND timestamp > now() - interval '7 days'
GROUP BY properties.ipAddress
ORDER BY attempts DESC
```

## Troubleshooting

### IDS Not Blocking Anyone

**Check:**

1. Is `ENABLE_IDS=true` set?
2. Is `ENABLE_IDS_DRY_RUN=true` set? (Dry run prevents blocking)
3. Are the IPs whitelisted?
4. Have thresholds been reached?

### Manual Blocks Not Working

**Manual blocks always work**, regardless of IDS settings. Check:

1. Database connection
2. Typo in IP address
3. IP might be whitelisted

### PostHog Events Not Appearing

**Check:**

1. `POSTHOG_API_KEY` and `POSTHOG_HOST` are set
2. Server logs for PostHog initialization messages
3. PostHog project settings allow server-side events

### False Positives

**Solutions:**

1. Add IP to whitelist
2. Increase thresholds for that attack type
3. Review injection detection patterns (might flag legitimate content)

## Production Checklist

Before enabling `ENABLE_IDS=true` in production:

- [ ] Ran dry run mode for at least 1 week
- [ ] Analyzed PostHog data for false positives
- [ ] Whitelisted own IPs and known good networks
- [ ] Tuned thresholds based on actual usage patterns
- [ ] Tested IP whitelist functionality
- [ ] Have monitoring dashboard ready (Security Dashboard)
- [ ] Can quickly disable if issues arise
- [ ] Team knows how to unblock IPs manually

## Environment Variable Summary

```bash
# === IDS Mode ===
ENABLE_IDS=true                      # Enable auto-blocking (default: disabled)
ENABLE_IDS_DRY_RUN=true             # Dry run: track but don't block (default: disabled)

# === PostHog Analytics (Required for tracking) ===
POSTHOG_API_KEY=phc_xxx             # Server-side PostHog API key
POSTHOG_HOST=https://app.posthog.com # PostHog instance URL

# === Brute Force Thresholds ===
IDS_BRUTE_FORCE_THRESHOLD=5         # Failed logins before block (default: 5)
IDS_BRUTE_FORCE_WINDOW_MIN=15       # Time window in minutes (default: 15)
IDS_BRUTE_FORCE_BLOCK_MIN=240       # Block duration in minutes (default: 240)

# === Rate Limit Thresholds ===
IDS_RATE_LIMIT_THRESHOLD=10         # Violations before block (default: 10)
IDS_RATE_LIMIT_WINDOW_MIN=15        # Time window in minutes (default: 15)
IDS_RATE_LIMIT_BLOCK_MIN=120        # Block duration in minutes (default: 120)

# === Injection Attack Thresholds ===
IDS_INJECTION_THRESHOLD=3           # SQL/XSS attempts before block (default: 3)
IDS_INJECTION_WINDOW_MIN=60         # Time window in minutes (default: 60)
IDS_INJECTION_BLOCK_MIN=1440        # Block duration in minutes (default: 1440)
```

## Safety Guarantees

1. **Manual blocks always work** - Admins can block IPs anytime, regardless of IDS settings
2. **Whitelist is absolute** - Whitelisted IPs never get auto-blocked
3. **Dry run is safe** - No blocking occurs in dry run mode
4. **Default is safe** - Without env vars, only manual blocking works
5. **Instant disable** - Remove `ENABLE_IDS=true` to stop auto-blocking immediately
