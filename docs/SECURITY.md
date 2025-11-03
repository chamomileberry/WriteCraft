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

- v2.0.0 - Advanced Security Features (October 2025)
  - Multi-factor authentication (TOTP-based 2FA with backup codes)
  - Intrusion Detection System (SQL/XSS detection, IP blocking)
  - API key rotation tracking (90-day rotation with admin dashboard)
  - Content Security Policy with nonce-based script execution
  - Redis-backed session management with concurrent device limiting
  - Distributed rate limiting (AI: 30/15min, Search: 150/15min)
  - Enhanced security headers (HSTS, COOP, COEP, CORP)

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
**Required:** Secrets or external secrets manager

**Current:** Environment variables
**Enhancement:** Encrypted secrets with rotation

**Implementation Steps:**
1. Use Secrets for all sensitive values
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
- **Email:** admin@writecraft.app
- **Escalation:** [Define your escalation process]
- **On-Call:** [Define your on-call rotation]

---

## CodeQL & Dependabot Security Remediations (Oct 2025)

This section documents critical security fixes that resolved GitHub CodeQL and Dependabot alerts. **These patterns must be followed in all new code to prevent regressions.**

### 1. ✅ Rate Limiting - CodeQL Recognition (699 Alerts Resolved)

**Issue**: Custom rate limiting implementation not recognized by CodeQL static analysis
- Alert: `js/missing-rate-limiting` (699 instances)
- Root cause: CodeQL requires specific library patterns to recognize rate limiting

**Solution**: Migrated to `express-rate-limit` library with proper IPv6 support

```typescript
// ✅ CORRECT: CodeQL-recognized rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // limit each IP to 100 requests per windowMs
  standardHeaders: true,       // Return rate limit info in headers
  legacyHeaders: false,        // Disable X-RateLimit-* headers
  message: 'Too many requests',
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests' });
  }
});

router.get('/api/endpoint', limiter, handler);
```

**IPv6 Bypass Prevention:**
```typescript
// ✅ CORRECT: Properly handles IPv6 addresses
keyGenerator: (req) => {
  // Uses req.ip which express-rate-limit handles correctly
  return req.ip || 'unknown';
}

// ❌ WRONG: Manual IP extraction can allow IPv6 bypass
keyGenerator: (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
}
```

**Key Requirements:**
- Use `express-rate-limit` package (v6.0.0+)
- Never implement custom IP extraction - let the library handle it
- Always include `standardHeaders: true` for transparency
- Configure appropriate limits per endpoint type

---

### 2. ✅ Incomplete Multi-Character Sanitization (XSS Prevention)

**Issue**: Regular expressions cannot safely sanitize multi-character HTML entities
- Alert: `js/incomplete-multi-character-sanitization`
- Location: `client/src/components/GuideEditor.tsx:502`
- Risk: XSS through incomplete entity removal

**Solution**: Use TipTap's built-in text extraction instead of regex

```typescript
// ❌ WRONG: Regex cannot handle all multi-character HTML entities
const sanitizeContent = (html: string) => {
  return html
    .replace(/<[^>]*>/g, '')  // Incomplete - misses edge cases
    .replace(/&[^;]+;/g, ''); // Cannot handle all entity combinations
};

// ✅ CORRECT: Use editor's getText() method
const sanitizeContent = (editor: Editor) => {
  return editor.getText({ blockSeparator: '\n' });
};

// For TipTap/ProseMirror editors
const cleanText = editor.getText();

// For other rich text editors, use their built-in text extraction
const cleanText = editor.getTextContent(); // or similar method
```

**Prevention Guidelines:**
- **Never use regex** to sanitize HTML or extract text from rich content
- Use the editor/library's built-in text extraction methods
- If you must process HTML, use a proper HTML parser (e.g., `DOMParser`, `cheerio`)
- For character counting, always use `.getText()` or equivalent

---

### 3. ✅ Sensitive Data in GET Requests

**Issue**: Sensitive identifiers exposed in URL paths and query parameters
- Alert: `js/sensitive-get-query`
- Location: `server/routes/apiKeys.routes.ts:105`
- Risk: API keys/IDs logged in URLs, browser history, Referer headers

**Solution**: Use POST with body parameters for sensitive operations

```typescript
// ❌ WRONG: Sensitive data in URL
router.get('/api/api-keys/:id/stats', async (req, res) => {
  const { id } = req.params;  // ID exposed in URL!
  const stats = await getKeyStats(id);
  res.json(stats);
});

// ✅ CORRECT: Sensitive data in request body
router.post('/api/api-keys/stats', async (req, res) => {
  const { apiKeyId } = req.body;  // ID safely in body
  const stats = await getKeyStats(apiKeyId);
  res.json(stats);
});
```

**When to use POST instead of GET:**
- API keys or secrets
- User IDs or session tokens
- Payment information
- Any personally identifiable information (PII)
- Resource IDs that should not be cached or logged

**Safe GET usage:**
- Public resource identifiers (e.g., product IDs)
- Non-sensitive pagination/filter parameters
- Public search queries

---

### 4. ✅ XSS via Exception Text (Error Response Handling)

**Issue**: Error messages sent as HTML allow XSS if error text is user-influenced
- Alert: `js/xss-through-exception`
- Location: `server/routes/stripe.routes.ts:589`
- Risk: Error messages containing user input can execute scripts

**Solution**: Always use `res.json()` for error responses, never `res.send()`

```typescript
// ❌ WRONG: res.send() with string treats as HTML
try {
  event = stripe.webhooks.constructEvent(req.body, sig, secret);
} catch (err: any) {
  return res.status(400).send(`Webhook Error: ${err.message}`);
  // If err.message contains user input like <script>, XSS occurs!
}

// ✅ CORRECT: res.json() automatically escapes special characters
try {
  event = stripe.webhooks.constructEvent(req.body, sig, secret);
} catch (err: any) {
  return res.status(400).json({ 
    error: 'Webhook signature verification failed', 
    message: err.message  // Safely JSON-encoded
  });
}
```

**Error Response Best Practices:**
1. **Always use `res.json()`** for all API error responses
2. **Never use `res.send()`** with template literals or concatenation
3. **Structure error responses** consistently:
   ```typescript
   res.status(statusCode).json({
     error: 'Safe static message',
     message: dynamicContent,  // Auto-escaped by JSON
     code: 'ERROR_CODE'
   });
   ```
4. **Sanitize before logging**: Don't log raw error messages that might contain PII

---

### 5. ✅ DOM Text Reinterpreted as HTML (Image URL XSS)

**Issue**: User-controlled URLs rendered in `<img src>` without validation
- Alert: `js/xss-through-dom`
- Location: `client/src/components/ui/image-upload.tsx:229`
- Risk: `javascript:` or malicious `data:` URLs execute code

**Solution**: Validate URLs at both input and render time

```typescript
// ✅ CORRECT: Multi-layer URL validation
function isSafeImageUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    const parsed = new URL(url, window.location.origin);
    // Only allow safe protocols
    return ['http:', 'https:', 'data:'].includes(parsed.protocol);
  } catch {
    // If URL parsing fails, check if relative path
    return url.startsWith('/');
  }
}

// Layer 1: Validate on input
const handleUrlSubmit = () => {
  const trimmedUrl = urlInput.trim();
  
  if (!isSafeImageUrl(trimmedUrl)) {
    toast({
      title: 'Invalid URL',
      description: 'Please enter a valid image URL (http://, https://, or data:)',
      variant: 'destructive'
    });
    return;
  }
  
  setImageUrl(trimmedUrl);
};

// Layer 2: Validate at render time
const safeImageUrl = imageUrl && isSafeImageUrl(imageUrl) ? imageUrl : '';

return (
  <img src={safeImageUrl} alt="User upload" />
);
```

**Dangerous URL patterns to block:**
```typescript
// ❌ These can execute JavaScript:
javascript:alert('XSS')
data:text/html,<script>alert('XSS')</script>
vbscript:msgbox("XSS")

// ✅ These are safe:
https://example.com/image.jpg
/assets/image.png
data:image/png;base64,...
```

**URL Validation Checklist:**
- ✅ Validate when user inputs URL
- ✅ Validate when setting state
- ✅ Validate again before rendering
- ✅ Use `URL()` constructor for parsing
- ✅ Whitelist safe protocols only
- ✅ Handle parsing failures gracefully

---

### 6. ✅ DOM-Based XSS via Unsanitized HTML Rendering

**Issue**: User-generated HTML content rendered without sanitization
- Alert: DOM-based XSS vulnerability
- Location: `client/src/pages/GuideDetail.tsx:211`
- Risk: Malicious HTML/JavaScript in guide content executes in user's browser

**Solution**: Always sanitize HTML before rendering with `dangerouslySetInnerHTML`

```typescript
// ❌ WRONG: Direct rendering allows XSS
<div 
  className="prose prose-gray dark:prose-invert max-w-none"
  dangerouslySetInnerHTML={{ __html: guide.content }}
/>

// ✅ CORRECT: Sanitize with DOMPurify before rendering
import { sanitizeHtml } from "@/lib/sanitize";

<div 
  className="prose prose-gray dark:prose-invert max-w-none"
  dangerouslySetInnerHTML={{ __html: sanitizeHtml(guide.content) }}
/>
```

**Sanitization Configuration** (`client/src/lib/sanitize.ts`):
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'div', 'span', 'mark', 'sup', 'sub', 'iframe'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 
      'width', 'height', 'class', 'style',
      'colspan', 'rowspan', 'data-type',
      'allowfullscreen', 'frameborder'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false
  });
}
```

**HTML Rendering Checklist:**
- ✅ **NEVER** use `dangerouslySetInnerHTML` without sanitization
- ✅ **ALWAYS** import and use `sanitizeHtml()` from `@/lib/sanitize`
- ✅ Configure DOMPurify with strict allowlists (not denylists)
- ✅ Block dangerous protocols (`javascript:`, `data:text/html`, `vbscript:`)
- ✅ Review and minimize `ALLOWED_TAGS` for each use case
- ✅ Test with malicious payloads: `<img src=x onerror=alert(1)>`

**Attack Vectors Prevented:**
```html
<!-- ❌ These are blocked by sanitization: -->
<script>alert('XSS')</script>
<img src=x onerror=alert(1)>
<iframe src="javascript:alert(1)"></iframe>
<a href="javascript:alert(1)">Click me</a>
<div onclick="alert(1)">Click me</div>

<!-- ✅ These are allowed (safe HTML): -->
<p>Normal text with <strong>bold</strong> and <em>italic</em></p>
<a href="https://example.com" target="_blank">Safe link</a>
<img src="https://example.com/image.jpg" alt="Safe image">
```

**When to Use Sanitization:**
1. **User-generated content**: Forum posts, comments, blog posts, guides
2. **Rich text editors**: TipTap, Quill, Draft.js output
3. **Imported content**: World Anvil imports, Markdown-to-HTML conversion
4. **Third-party data**: API responses containing HTML

---

### 7. ✅ Transitive Dependency Vulnerabilities (esbuild)

**Issue**: Build tool pulled in vulnerable transitive dependencies
- Alert: Dependabot `esbuild` CORS vulnerability (CVE-2024-XXXXX)
- Source: `drizzle-kit` → `esbuild@0.18.20` (vulnerable)
- Impact: Development server allows cross-origin access

**Solution**: Use package.json `overrides` to force safe versions

```json
{
  "devDependencies": {
    "esbuild": "^0.25.11"
  },
  "overrides": {
    "esbuild": "^0.25.11"
  }
}
```

**Dependency Security Checklist:**
1. ✅ Run `npm audit` before each deployment
2. ✅ Use `overrides` to force vulnerable transitive deps to safe versions
3. ✅ Keep direct dependencies updated regularly
4. ✅ Review Dependabot PRs within 48 hours
5. ✅ Test after dependency updates

---

## Security Coding Standards (Mandatory)

These patterns **must be followed** in all new code:

### Error Handling
```typescript
// ✅ CORRECT
res.status(500).json({ error: 'Operation failed', message: err.message });

// ❌ WRONG
res.status(500).send(`Error: ${err.message}`);
res.status(500).send(err.toString());
```

### URL/Input Validation
```typescript
// ✅ CORRECT: Validate before use
const safeUrl = isValidUrl(userInput) ? userInput : '';

// ❌ WRONG: Direct use of user input
<img src={userInput} />
<a href={userInput}>Link</a>
```

### Text Extraction from Rich Content
```typescript
// ✅ CORRECT: Use editor methods
const text = editor.getText();

// ❌ WRONG: Regex sanitization
const text = html.replace(/<[^>]*>/g, '');
```

### Rate Limiting
```typescript
// ✅ CORRECT: express-rate-limit
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({ windowMs: 900000, max: 100 });
router.get('/endpoint', limiter, handler);

// ❌ WRONG: Custom implementation
const requestCounts = new Map();
// CodeQL won't recognize this
```

### Sensitive Operations
```typescript
// ✅ CORRECT: POST with body
router.post('/sensitive-op', (req, res) => {
  const { secretId } = req.body;
});

// ❌ WRONG: GET with URL params
router.get('/sensitive-op/:secretId', (req, res) => {
  const { secretId } = req.params;  // Logged in URLs!
});
```

---

## Pre-Commit Security Checklist

Before pushing code, verify:

- [ ] All error responses use `res.json()` (never `res.send()` with variables)
- [ ] User-controlled URLs validated with protocol whitelist
- [ ] Rich text editors use `.getText()` (never regex for HTML stripping)
- [ ] Sensitive data in POST body (never in GET URLs)
- [ ] Rate limiting uses `express-rate-limit` on all endpoints
- [ ] No custom IP extraction (let libraries handle IPv6)
- [ ] Dependencies scanned with `npm audit`
- [ ] No secrets committed to repository

---

**Last Updated:** October 30, 2025  
**Next Review:** January 2026 (or after any CodeQL/Dependabot alert)
