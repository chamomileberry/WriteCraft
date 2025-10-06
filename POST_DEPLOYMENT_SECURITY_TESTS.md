# Post-Deployment Security Testing Checklist

## Authenticated Security Flows to Verify

After deploying WriteCraft, test these security measures with real authenticated sessions to ensure all protections work correctly.

---

## 1. CSRF Protection Testing

**What to test:** CSRF tokens prevent unauthorized state changes

### Test Steps:
1. **Log in** to your deployed application
2. **Open browser DevTools** → Network tab
3. **Get a CSRF token:**
   - Make a GET request to `/api/auth/csrf-token`
   - Note the token in the response
4. **Test CSRF rejection:**
   - Try updating your profile WITHOUT the CSRF token header
   - Expected: Request rejected (403 or 400)
5. **Test CSRF success:**
   - Update your profile WITH the CSRF token in `X-CSRF-Token` header
   - Expected: Update succeeds

**Expected Results:**
- ❌ Requests without CSRF token → Rejected
- ✅ Requests with valid CSRF token → Succeed

---

## 2. Admin Field Protection Testing

**What to test:** Users cannot elevate themselves to admin status

### Test Steps:
1. **Log in as a regular user** (non-admin)
2. **Open browser DevTools** → Network tab
3. **Attempt privilege escalation:**
   - Send PATCH request to `/api/users/{your-user-id}`
   - Include in request body: `{"isAdmin": true, "firstName": "Test"}`
4. **Check your user record:**
   - Refresh the page
   - Check if `isAdmin` field changed

**Expected Results:**
- ❌ isAdmin field remains `false` (not elevated)
- ✅ Only firstName updated, isAdmin ignored
- Schema validation should reject additional fields

---

## 3. Row-Level Security (RLS) Testing

**What to test:** Users can only access their own data

### Test Steps:

#### A. Notebook Access Test
1. **Log in as User A**
2. **Create a notebook** and note its ID (from URL or response)
3. **Log out and log in as User B**
4. **Try to access User A's notebook:**
   - Navigate to `/notebooks/{user-a-notebook-id}`
   - Or make API call to `/api/notebooks/{user-a-notebook-id}`
5. **Expected:** 404 Not Found (not 403, to prevent enumeration)

#### B. Character/Content Access Test
1. **Log in as User A**
2. **Create a character in a notebook** and note the character ID
3. **Log out and log in as User B**
4. **Try to access User A's character:**
   - Make API call to `/api/characters/{user-a-character-id}`
5. **Expected:** 404 Not Found

#### C. Update/Delete Attempt Test
1. **As User B, try to delete User A's content:**
   - Send DELETE to `/api/notebooks/{user-a-notebook-id}`
   - Send DELETE to `/api/characters/{user-a-character-id}`
2. **Expected:** 404 Not Found (deletion fails)

**Expected Results:**
- ❌ User B cannot view User A's notebooks → 404
- ❌ User B cannot view User A's characters → 404  
- ❌ User B cannot update/delete User A's content → 404
- ✅ User B can only access their own data

---

## 4. Rate Limiting (Authenticated Users)

**What to test:** Rate limits apply to authenticated requests

### Test Steps:
1. **Log in to your application**
2. **Open browser DevTools** → Network tab
3. **Make rapid requests to any endpoint:**
   - Refresh your profile page 10+ times quickly
   - Or make multiple API calls in succession
4. **Check response headers:**
   - Look for `X-RateLimit-Limit` (should be 100)
   - Look for `X-RateLimit-Remaining` (should decrease: 99, 98, 97...)
   - Look for `X-RateLimit-Reset` (timestamp)
5. **Make 100+ requests rapidly** (if possible)
6. **Expected:** 429 Too Many Requests after limit exceeded

**Expected Results:**
- ✅ Rate limit headers present in responses
- ✅ Remaining count decreases with each request
- ✅ 429 status code after exceeding limit (100 req/15min)

---

## 5. Admin-Only Endpoints Testing

**What to test:** Only admins can access admin endpoints

### Test Steps:
1. **Log in as regular user** (non-admin)
2. **Try to access admin endpoints:**
   - GET `/api/admin/users`
   - PATCH `/api/admin/users/{some-id}/role`
3. **Expected:** 403 Forbidden or 401 Unauthorized

4. **Log in as admin user**
5. **Access same admin endpoints**
6. **Expected:** Success (200/204 responses)

**Expected Results:**
- ❌ Regular users → Cannot access admin endpoints
- ✅ Admin users → Can access admin endpoints

---

## 6. Session Security Testing

**What to test:** Sessions expire and are properly validated

### Test Steps:
1. **Log in to your application**
2. **Wait for session timeout** (check session config)
3. **Try to access protected resource** after timeout
4. **Expected:** 401 Unauthorized (session expired)

5. **Log in again**
6. **Manually delete session cookie** in DevTools
7. **Refresh page**
8. **Expected:** Redirected to login

**Expected Results:**
- ✅ Expired sessions rejected
- ✅ Missing sessions require re-authentication

---

## 7. Input Sanitization (Already Verified ✅)

This was verified during development with runtime tests:
- ✅ SQL injection blocked (400 "Invalid input detected")
- ✅ XSS attacks blocked (400 "Invalid input detected")
- ✅ Prototype pollution blocked (dangerous keys removed)

**No additional post-deployment testing needed** - these protections work pre-authentication.

---

## Testing Tools

### Browser DevTools Method:
1. Open DevTools (F12)
2. Go to Network tab
3. Right-click any request → "Edit and Resend"
4. Modify headers/body to test security

### Using Curl (Command Line):
```bash
# Get CSRF token
curl -X GET https://your-app.replit.app/api/auth/csrf-token \
  --cookie "session=your-session-cookie"

# Test admin field injection
curl -X PATCH https://your-app.replit.app/api/users/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your-csrf-token" \
  --cookie "session=your-session-cookie" \
  -d '{"isAdmin": true, "firstName": "Test"}'

# Test RLS (try accessing another user's notebook)
curl -X GET https://your-app.replit.app/api/notebooks/OTHER_USER_NOTEBOOK_ID \
  --cookie "session=your-session-cookie"
```

---

## Quick Verification Checklist

After deployment, verify:

- [ ] CSRF tokens required for state-changing operations
- [ ] isAdmin field cannot be set via user endpoints
- [ ] Users cannot access other users' notebooks/characters (404 responses)
- [ ] Rate limit headers present and counting down
- [ ] Regular users cannot access admin endpoints
- [ ] Sessions expire and require re-authentication
- [ ] Input sanitization blocks SQL injection/XSS (already verified ✅)

---

## What's Already Verified ✅

The following were tested during development:
- ✅ Input sanitization blocks malicious payloads
- ✅ Security headers present (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ Authentication enforcement (401 for unauthenticated requests)
- ✅ Middleware ordering correct (sanitization after body parsing)
- ✅ Rate limiting configured and active

## Support

If any test fails, check:
1. `SECURITY.md` for implementation details
2. `SECURITY_SUMMARY.md` for security architecture
3. Server logs for security event messages
