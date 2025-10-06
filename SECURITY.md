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
- [ ] Multi-factor authentication (recommended for admin users)
- [ ] API key rotation policy
- [ ] Intrusion detection system

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