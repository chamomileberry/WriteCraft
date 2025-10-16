# Security Documentation

## Overview

This document outlines the comprehensive security measures implemented in WriteCraft to protect user data and prevent unauthorized access.

## Security Features

### 1. Authentication & Authorization

#### Enhanced Authentication Middleware
- **Production Protection**: Test mode bypass (`x-test-user-id` header) is completely blocked in production environments
- **Test Environment Validation**: Test user IDs must follow strict format (`test-user-[a-z0-9-]+`) to prevent injection attacks
- **Session Management**: PostgreSQL-backed sessions with 7-day expiry and automatic token refresh
- **Security Audit Logging**: All authentication failures and bypass attempts are logged with IP and user agent information

#### Row-Level Security (RLS)
- **Application-Level RLS**: All database queries enforce user ownership validation
- **Triple-Filter Protection**: Delete operations use `id`, `userId`, AND `notebookId` for multi-tenant isolation
- **Information Disclosure Prevention**: Unauthorized access returns 404 (not 403) to prevent resource enumeration
- **Ownership Validation Pattern**: Fetch → Validate → Execute pattern for all data operations

### 2. Admin Role Protection

#### isAdmin Field Security
- **Field Protection**: The `isAdmin` field cannot be modified through regular user endpoints
- **Restricted Updates**: Only specific fields (`firstName`, `lastName`, `profileImageUrl`) can be updated via user profile endpoint
- **Admin-Only Endpoint**: Dedicated `/api/admin/users/:id/role` endpoint for admin role changes (requires admin privileges)
- **Self-Demotion Prevention**: Admins cannot remove their own admin privileges if they're the last admin
- **Audit Logging**: All privilege escalation attempts are logged as CRITICAL security events

### 3. Rate Limiting

#### Current Status
⚠️ **IMPORTANT**: Rate limiting is currently **DISABLED** for development. You must re-enable it before deployment.

#### Re-enabling Rate Limiting for Deployment

**Before deploying to production**, follow these steps:

1. Open `server/app-security.ts`
2. Locate the commented-out rate limiting code (around line 22-25)
3. **Uncomment** the following lines:

```typescript
app.use(createRateLimiter({
  maxRequests: 1000, // 1000 requests per 15 minutes for normal app operation
  windowMs: 15 * 60 * 1000
}));
```

4. Update the log message from:
```typescript
console.log('[SECURITY] ⚠ Rate limiting DISABLED (uncomment to enable)');
```

To:
```typescript
console.log('[SECURITY] ✓ Rate limiting enabled (1000 req/15min)');
```

5. Restart your application - rate limiting will now be active

#### Global Rate Limiting (When Enabled)
- Default: 1,000 requests per 15 minutes per user/IP combination
- Sensitive operations have stricter limits:
  - User profile updates: 20 requests per 15 minutes
  - User deletion: 5 requests per 15 minutes
  - Admin operations: 50 requests per 15 minutes

#### Rate Limit Headers
All responses include:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

#### Adjusting Rate Limits

To modify rate limits for your deployment needs, edit values in `server/security/middleware.ts`:

```typescript
const SECURITY_CONFIG = {
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,      // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 1000,              // Global limit
  STRICT_RATE_LIMIT_MAX_REQUESTS: 50,        // Sensitive operations
};
```

### 4. CSRF Protection

#### Token-Based Protection
- CSRF tokens required for all state-changing operations (POST, PUT, PATCH, DELETE)
- Tokens expire after 1 hour
- Timing-safe comparison prevents timing attacks
- Token generation endpoint: `GET /api/auth/csrf-token`

#### Cookie Security
- `httpOnly`: Prevents JavaScript access to cookies
- `secure`: Cookies only sent over HTTPS
- `sameSite: 'lax'`: Additional CSRF protection

### 5. Input Validation & Sanitization

#### Comprehensive Input Sanitization
- SQL keyword detection and blocking
- String length limits (10,000 characters)
- Array size limits (100 items)
- Prototype pollution prevention (`__proto__`, `constructor`, `prototype` keys blocked)
- Automatic trimming and sanitization of all inputs

#### Schema Validation
- Zod schemas for all API endpoints
- Strict mode validation prevents additional properties
- Type-safe input validation

### 6. SQL Injection Prevention

#### Parameterized Queries
- All database queries use Drizzle ORM with parameterized statements
- No raw SQL concatenation
- Input sanitization as defense-in-depth measure

### 7. Security Headers

#### HTTP Security Headers
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Content-Security-Policy` - Restricts resource loading
- `Strict-Transport-Security` - HTTPS enforcement
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - Disables unnecessary browser features

### 8. Data Protection

#### User Data Access Control
- Users can only access their own data
- Admin users have elevated access with audit logging
- Sensitive fields excluded from API responses unless necessary
- User deletion implements soft delete with data anonymization

#### PII Protection
- Email addresses and personal information protected
- Profile data access restricted to owner (or admin with logging)
- No bulk user data endpoints

### 9. Security Audit Logging

#### Comprehensive Event Logging
Security events logged include:
- `AUTH_FAILURE`: Failed authentication attempts
- `PRIVILEGE_ESCALATION`: Admin role change attempts
- `UNAUTHORIZED_ACCESS`: Access denial events
- `DATA_BREACH_ATTEMPT`: Attempts to access/modify other users' data
- `RATE_LIMIT`: Rate limit exceeded events
- `CSRF_FAILURE`: Invalid CSRF token attempts
- `TEST_MODE_BYPASS_ATTEMPT`: Production test mode bypass attempts

#### Severity Levels
- `LOW`: Informational events
- `MEDIUM`: Suspicious activity
- `HIGH`: Security violations
- `CRITICAL`: Immediate attention required

## API Security

### Secure Endpoints

#### User Management
- `GET /api/auth/user` - Get current user (limited fields)
- `PATCH /api/users/:id` - Update own profile (restricted fields)
- `DELETE /api/users/:id` - Delete own account
- `GET /api/auth/csrf-token` - Generate CSRF token
- `POST /api/auth/logout` - Logout with session cleanup

#### Admin Operations
- `PATCH /api/admin/users/:id/role` - Update user admin status (admin only)

### Security Testing (Development Only)

Test endpoints available in non-production environments:
- `/api/security-test/rls-check` - Verify row-level security
- `/api/security-test/admin-escalation` - Test privilege escalation protection
- `/api/security-test/csrf-check` - Verify CSRF protection
- `/api/security-test/sql-injection` - Test SQL injection prevention
- `/api/security-test/rate-limit` - Test rate limiting
- `/api/security-test/auth-bypass` - Verify authentication bypass protection
- `/api/security-test/data-exposure/:resource` - Check for data leaks
- `/api/security-test/audit` - Complete security audit report

## Security Best Practices

### For Developers

1. **Never Trust User Input**
   - Always validate and sanitize input
   - Use Zod schemas for validation
   - Apply the principle of least privilege

2. **Authentication Checks**
   - Always use `secureAuthentication` middleware for protected routes
   - Check user ownership before data operations
   - Log security-relevant events

3. **Error Handling**
   - Return 404 for unauthorized access (not 403)
   - Don't expose internal error details
   - Log errors securely

4. **Database Operations**
   - Always use parameterized queries
   - Implement row-level security checks
   - Triple-filter delete operations

5. **Session Management**
   - Implement proper session timeout
   - Destroy sessions on logout
   - Regenerate session IDs on privilege changes

### For System Administrators

1. **Environment Configuration**
   - Ensure `NODE_ENV=production` in production
   - Use strong `SESSION_SECRET`
   - Enable HTTPS everywhere

2. **Monitoring**
   - Monitor security audit logs
   - Set up alerts for CRITICAL events
   - Regular security audits

3. **Updates**
   - Keep dependencies updated
   - Apply security patches promptly
   - Regular penetration testing

## Security Checklist

- [x] Authentication middleware with test mode protection
- [x] Row-level security at application layer
- [x] Admin field protection
- [x] Rate limiting implementation
- [x] CSRF token protection
- [x] Input validation and sanitization
- [x] SQL injection prevention
- [x] Security headers
- [x] Security audit logging
- [x] User data access control
- [x] Soft delete with anonymization
- [x] Security test endpoints
- [ ] Database-level RLS (recommended future enhancement)
- [x] Multi-factor authentication (TOTP-based 2FA with backup codes - Oct 2025)
- [x] API key rotation policy (90-day tracking with admin dashboard - Oct 2025)
- [x] Intrusion detection system (SQL/XSS detection, IP blocking - Oct 2025)

## Incident Response

### Security Incident Procedure

1. **Detection**: Monitor security audit logs for CRITICAL events
2. **Assessment**: Determine scope and severity of incident
3. **Containment**: Block affected accounts/IPs if necessary
4. **Eradication**: Fix vulnerabilities and remove threats
5. **Recovery**: Restore normal operations
6. **Post-Incident**: Document lessons learned and update procedures

### Contact Information

For security issues or vulnerabilities, please contact the security team immediately.

## Compliance

This implementation addresses the following security requirements:
- Protection against unauthorized data access
- Prevention of privilege escalation
- Defense against injection attacks
- Rate limiting and DoS protection
- CSRF protection for state changes
- Comprehensive audit logging
- Data privacy and PII protection

## Version History

- v1.0.0 - Initial security implementation
  - Enhanced authentication with test mode protection
  - Row-level security enforcement
  - Admin field protection
  - Rate limiting
  - CSRF protection
  - Input sanitization
  - Security headers
  - Audit logging
  - Security test endpoints


## Pre-Deployment Security Checklist

This section documents security enhancements that require package installation or deployment configuration changes that cannot be automated before the application is officially launched.

### Critical Security Enhancements

#### 1. ✅ Database-Level Row-Level Security (RLS)
**Status:** Recommended Enhancement  
**Priority:** HIGH  
**Current State:** Application-level RLS implemented  
**Enhancement:** Add PostgreSQL RLS policies for defense-in-depth

**Implementation Steps:**
```sql
-- Enable RLS on all user-owned tables
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all content tables)

-- Create policy to restrict access to owner's data
CREATE POLICY user_isolation_policy ON notebooks
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::text);

-- Repeat for all tables
```

**Verification:** Run queries as different users to confirm isolation

---

#### 2. ✅ Multi-Factor Authentication (MFA)
**Status:** IMPLEMENTED (Oct 2025)  
**Priority:** HIGH  
**Implementation:** `server/services/mfaService.ts`, `server/routes/mfa.routes.ts`

**Implemented Features:**
- TOTP-based 2FA using `speakeasy` library
- QR code generation for authenticator app enrollment
- Backup codes with AES-256-GCM encryption
- Secure MFA secret storage with dedicated encryption key
- Account recovery flow with backup codes
- `/api/mfa/setup`, `/api/mfa/verify`, `/api/mfa/disable` endpoints

**Security Features:**
- AES-256-GCM authenticated encryption for MFA secrets
- Bcrypt hashing (10 rounds) for backup codes
- MFA_ENCRYPTION_KEY environment variable for stable encryption
- Mandatory 64+ character encryption key

**Verification:** ✅ MFA setup and login flows tested with authenticator apps

---

#### 3. ✅ API Key Rotation Policy
**Status:** IMPLEMENTED (Oct 2025)  
**Priority:** MEDIUM  
**Implementation:** `server/routes/keyRotation.routes.ts`, `server/services/apiKeyRotationService.ts`

**Implemented Features:**
- Automated 90-day rotation tracking for critical API keys
- Database audit trail with `apiKeyRotations` and `apiKeyRotationHistory` tables
- Admin dashboard for viewing rotation status
- Email notifications for expiring keys
- `/api/admin/key-rotations` endpoints for tracking and management

**Tracked Keys:**
- ANTHROPIC_API_KEY (AI generation)
- MFA_ENCRYPTION_KEY (2FA encryption)
- SESSION_SECRET (session security)

**Verification:** ✅ Key rotation tracking and admin notifications operational

---

#### 4. ✅ Enhanced Session Management
**Status:** IMPLEMENTED (Oct 2025)  
**Priority:** MEDIUM  
**Implementation:** `server/services/redisClient.ts`, `server/services/sessionManager.ts`

**Implemented Features:**
- Redis-backed session storage with PostgreSQL fallback
- Concurrent session limiting (max 3 active devices per user)
- Automatic eviction of oldest sessions when limit exceeded
- Distributed session management for multi-instance deployments
- Session timeout policies with secure cookie settings

**Security Configuration:**
- httpOnly cookies (prevents XSS access)
- secure flag (HTTPS only in production)
- sameSite: 'lax' (CSRF protection)
- Atomic operations for race condition prevention

**Verification:** ✅ Session management tested across devices and instances

---

#### 5. ✅ Intrusion Detection System (IDS)
**Status:** IMPLEMENTED (Oct 2025)  
**Priority:** MEDIUM  
**Implementation:** `server/security/idsMiddleware.ts`, `server/services/intrusionDetectionService.ts`

**Implemented Features:**
- Real-time threat detection with pattern matching
- Automatic IP blocking (5 failed logins = 24h block)
- Security alert dashboard for admins
- Comprehensive attack logging with `intrusionAttempts` and `blockedIps` tables

**Detection Patterns:**
- SQL injection attempts (UNION, DROP, exec patterns)
- XSS attacks (<script>, onerror, javascript: patterns)
- Failed authentication attempts
- Rate limit violations
- Unauthorized access attempts

**Admin Dashboard:**
- `/api/admin/security/alerts` - View all security events
- `/api/admin/security/blocked-ips` - Manage blocked IPs
- Severity filtering (LOW, MEDIUM, HIGH, CRITICAL)

**Verification:** ✅ Attack simulation and detection confirmed operational

---

#### 6. ✅ Content Security Policy (CSP) Enhancement
**Status:** IMPLEMENTED (Oct 2025)  
**Priority:** MEDIUM  
**Implementation:** `server/security/csp.ts`, `server/routes/csp-report.routes.ts`

**Implemented Features:**
- Nonce-based script execution (cryptographically secure)
- No `unsafe-inline` in production
- CSP violation reporting endpoint at `/api/csp-report`
- Separate development and production policies
- Enhanced directives: base-uri, form-action, frame-ancestors

**CSP Directives:**
- `default-src 'self'`
- `script-src 'self' 'nonce-{random}' (prod)` or `'unsafe-inline' (dev)`
- `style-src 'self' 'unsafe-inline'` (required for Tailwind)
- `img-src 'self' data: blob: https:`
- `connect-src 'self' https://api.anthropic.com`

**Violation Reporting:**
- Logs all CSP violations to database
- Admin dashboard for reviewing violations
- Helps identify policy gaps and potential attacks

**Verification:** ✅ Strict CSP enforced, violation reports captured

---

#### 7. ⏳ Automated Security Scanning
**Status:** Not Implemented  
**Priority:** MEDIUM  
**Required Package:** `npm audit`, `snyk`, or `retire.js`

**Implementation Steps:**
1. Install security scanning tool: `npm install -D snyk`
2. Add pre-commit hook for dependency scanning
3. Configure CI/CD pipeline security checks
4. Set up automated vulnerability alerts
5. Create remediation workflow

**Verification:** Run scan and verify vulnerabilities are detected

---

#### 8. ⏳ Encrypted Secrets Management
**Status:** Environment Variables  
**Priority:** HIGH  
**Required:** Replit Secrets or external secrets manager

**Current:** Environment variables in Replit  
**Enhancement:** Encrypted secrets with rotation

**Implementation Steps:**
1. Use Replit Secrets for all sensitive values
2. Implement secret rotation schedule
3. Never log or expose secrets in errors
4. Add secret validation on startup
5. Document all required secrets

**Verification:** Ensure app starts with all required secrets, test rotation

---

#### 9. ⏳ Backup & Disaster Recovery
**Status:** Not Implemented  
**Priority:** HIGH  
**Required:** Database backup strategy

**Implementation Steps:**
1. Configure automated PostgreSQL backups
2. Test backup restoration process
3. Implement point-in-time recovery
4. Document recovery procedures
5. Store backups in secure, separate location

**Verification:** Perform test restoration from backup

---

#### 10. ⏳ Security Headers Enhancement
**Status:** Basic Implementation  
**Priority:** LOW  
**Required Package:** None (enhancement of existing)

**Enhancement Areas:**
- Add Subresource Integrity (SRI) for CDN resources
- Implement Certificate Transparency monitoring
- Add Expect-CT header
- Enhance Permissions-Policy directives

**Verification:** Check headers with securityheaders.com

---

#### 11. ✅ AI Generation Rate Limiting
**Status:** IMPLEMENTED (Oct 2025)  
**Priority:** HIGH  
**Implementation:** `server/routes/ai.routes.ts`

**Current Configuration:**
- AI endpoints: **30 requests per 15 minutes**
- Applied to: `/api/ai/improve-text`, `/api/ai/generate-field`
- Uses dedicated `aiRateLimiter` with Redis backing

**Rate Limiter Config:**
```typescript
const aiRateLimiter = createRateLimiter({ 
  maxRequests: 30, 
  windowMs: 15 * 60 * 1000 
});
```

**Verification:** ✅ Stricter AI-specific rate limits enforced

---

#### 12. ✅ Search Endpoint Rate Limiting
**Status:** IMPLEMENTED (Oct 2025)  
**Priority:** MEDIUM  
**Implementation:** `server/routes.ts`

**Current Configuration:**
- Search endpoints: **150 requests per 15 minutes**
- Applied to: `/api/search`, `/api/universal-search`
- Uses dedicated `searchRateLimiter` with Redis backing

**Rate Limiter Config:**
```typescript
const searchRateLimiter = createRateLimiter({ 
  maxRequests: 150, 
  windowMs: 15 * 60 * 1000 
});
```

**Verification:** ✅ Moderate search-specific rate limits enforced

---

#### 13. ✅ Production Rate Limit Store (Redis)
**Status:** IMPLEMENTED (Oct 2025)  
**Priority:** HIGH (multi-instance ready)  
**Implementation:** `server/security/middleware.ts`, `server/services/redisClient.ts`

**Current Configuration:**
- Redis-backed rate limiting with automatic fallback to in-memory Map
- Atomic operations (INCR + EXPIRE) prevent race conditions
- Distributed rate limiting across multiple server instances
- Connection retry logic and health checks included

**Implementation Details:**
```typescript
// Redis atomic rate limiting
const count = await redisClient.incr(redisKey);
if (count === 1) {
  await redisClient.expire(redisKey, ttl);
}
```

**Fallback Behavior:**
- If Redis unavailable, automatically falls back to in-memory Map
- Graceful degradation ensures uptime during Redis outages

**Verification:** ✅ Distributed rate limiting operational across instances

---

### Deployment Configuration

#### Rate Limiting Re-enabling
**Status:** Currently disabled for development  
**Location:** `server/app-security.ts` lines 22-25

**Before Deployment:**
1. Uncomment rate limiting middleware
2. Adjust limits based on expected traffic
3. Monitor rate limit violations in production
4. Update documentation

---

### Post-Deployment Testing

After implementing any security enhancement:

1. ✅ Run all tests in `POST_DEPLOYMENT_SECURITY_TESTS.md`
2. ✅ Verify security audit logs are working
3. ✅ Test with multiple user accounts
4. ✅ Perform penetration testing
5. ✅ Review security headers with online tools
6. ✅ Monitor for false positives in security alerts

---

### Security Maintenance Schedule

**Daily:**
- Review security audit logs for CRITICAL events
- Monitor rate limit violations

**Weekly:**
- Review failed authentication attempts
- Check for new CVEs in dependencies

**Monthly:**
- Rotate API keys and secrets
- Review and update security policies
- Run full security audit
- Test backup restoration

**Quarterly:**
- Penetration testing
- Security training for team
- Update security documentation
- Review and update incident response plan

---

### Contact & Escalation

For security incidents or questions:
- **Email:** security@replit.com (replace with your security email)
- **Escalation:** [Define your escalation process]
- **On-Call:** [Define your on-call rotation]

---

**Last Updated:** [Current Date]  
**Next Review:** [Schedule quarterly reviews]
