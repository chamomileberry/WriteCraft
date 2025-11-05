# Subresource Integrity (SRI) Implementation Guide

**Last Updated:** October 16, 2025  
**Version:** 1.0.0

## Overview

Subresource Integrity (SRI) is a security feature that enables browsers to verify that files from CDNs haven't been tampered with. This document outlines SRI implementation for the WriteCraft platform.

## Current Status

**WriteCraft Build System:** Vite (self-hosted assets)

- ✅ All JavaScript and CSS assets are bundled and served from our own domain
- ✅ No external CDN dependencies for application code
- ✅ Content Security Policy (CSP) prevents unauthorized script execution

**SRI Status:** Not currently required (no external scripts/styles)

## When to Implement SRI

Implement SRI when you add:

1. **External JavaScript libraries** (from CDN)
2. **External CSS frameworks** (from CDN)
3. **Third-party widgets** (analytics, chat, etc.)
4. **Web fonts** from external services

## Implementation Guide

### 1. Generating SRI Hashes

#### For External Resources

```bash
# Generate SHA-384 hash for a file
curl -s https://cdn.example.com/library.js | \
  openssl dgst -sha384 -binary | \
  openssl base64 -A

# Output example:
# sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC
```

#### For Local Files (Testing)

```bash
# Generate hash for local file
cat public/assets/script.js | \
  openssl dgst -sha384 -binary | \
  openssl base64 -A
```

### 2. Adding SRI to HTML

#### External Script Tag

```html
<script
  src="https://cdn.example.com/library@1.0.0/lib.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"
></script>
```

#### External Stylesheet

```html
<link
  rel="stylesheet"
  href="https://cdn.example.com/framework@2.0.0/styles.min.css"
  integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
  crossorigin="anonymous"
/>
```

### 3. Automated SRI Generation

#### Using Webpack Plugin (if migrating from Vite)

```javascript
// webpack.config.js
const SriPlugin = require("webpack-subresource-integrity");

module.exports = {
  plugins: [
    new SriPlugin({
      hashFuncNames: ["sha256", "sha384"],
      enabled: process.env.NODE_ENV === "production",
    }),
  ],
  output: {
    crossOriginLoading: "anonymous",
  },
};
```

#### Using Vite Plugin

```javascript
// vite.config.ts
import { defineConfig } from "vite";
import { viteSriPlugin } from "vite-plugin-sri";

export default defineConfig({
  plugins: [
    viteSriPlugin({
      algorithms: ["sha384"],
    }),
  ],
});
```

### 4. CSP Integration with SRI

Update CSP headers to work with SRI:

```typescript
// server/security/middleware.ts
const scriptSrc = isDevelopment
  ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
  : `'self' 'nonce-${nonce}' 'sha384-...'`; // Add SRI hashes

res.setHeader('Content-Security-Policy',
  `default-src 'self'; ` +
  `script-src ${scriptSrc}; ` +
  // ... rest of policy
);
```

## Common External Resources

### Analytics (Example: Google Analytics)

```html
<!-- Google Analytics with SRI -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  integrity="sha384-[HASH]"
  crossorigin="anonymous"
></script>
```

### Icon Libraries (Example: Font Awesome)

```html
<!-- Font Awesome with SRI -->
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
  integrity="sha384-[HASH]"
  crossorigin="anonymous"
/>
```

### UI Frameworks (Example: Bootstrap)

```html
<!-- Bootstrap CSS with SRI -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
  integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM"
  crossorigin="anonymous"
/>
```

## Security Best Practices

### 1. Always Use HTTPS

- SRI requires HTTPS to function properly
- Never use SRI with HTTP resources

### 2. Use Strong Hash Algorithms

- **Recommended:** SHA-384 or SHA-512
- **Avoid:** SHA-256 (less secure)
- **Never use:** MD5 or SHA-1

### 3. Include `crossorigin` Attribute

```html
<!-- Required for CORS resources -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-..."
  crossorigin="anonymous"
></script>
```

### 4. Fallback Strategy

```html
<!-- Primary CDN with SRI -->
<script
  src="https://cdn1.example.com/lib@1.0.0.js"
  integrity="sha384-..."
  crossorigin="anonymous"
  onerror="loadFallback()"
></script>

<!-- Fallback CDN -->
<script>
  function loadFallback() {
    const script = document.createElement("script");
    script.src = "https://cdn2.example.com/lib@1.0.0.js";
    script.integrity = "sha384-...";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }
</script>
```

## Testing SRI Implementation

### 1. Verify Hash Correctness

```bash
# Download resource
curl -s https://cdn.example.com/library.js > library.js

# Generate hash
cat library.js | openssl dgst -sha384 -binary | openssl base64 -A

# Compare with integrity attribute
```

### 2. Test with Modified Resource

```html
<!-- Intentionally wrong hash (should block) -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-INVALID_HASH"
  crossorigin="anonymous"
></script>
```

Expected browser console error:

```
Failed to find a valid digest in the 'integrity' attribute for
resource 'https://cdn.example.com/lib.js' with computed SHA-384
integrity '...'. The resource has been blocked.
```

### 3. Browser DevTools Verification

1. Open DevTools → Network tab
2. Load page with SRI-protected resources
3. Check for integrity validation errors
4. Verify resources load successfully

## Monitoring & Maintenance

### 1. Track SRI Failures

```typescript
// Log SRI failures to security alerts
window.addEventListener(
  "error",
  (event) => {
    if (event.message.includes("integrity")) {
      fetch("/api/security-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SRI_FAILURE",
          message: event.message,
          filename: event.filename,
        }),
      });
    }
  },
  true,
);
```

### 2. Update Hashes on Library Updates

```bash
#!/bin/bash
# update-sri-hashes.sh

# Update library version
NEW_VERSION="2.0.0"
LIB_URL="https://cdn.example.com/library@${NEW_VERSION}/lib.min.js"

# Generate new hash
NEW_HASH=$(curl -s $LIB_URL | openssl dgst -sha384 -binary | openssl base64 -A)

echo "New SRI hash for version ${NEW_VERSION}:"
echo "sha384-${NEW_HASH}"

# Update in HTML template
sed -i "s|integrity=\"sha384-.*\"|integrity=\"sha384-${NEW_HASH}\"|g" index.html
```

### 3. Automated Hash Verification

```typescript
// verify-sri.ts
import crypto from "crypto";
import https from "https";

async function verifySRI(url: string, expectedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const hash = crypto.createHash("sha384");
        res.on("data", (chunk) => hash.update(chunk));
        res.on("end", () => {
          const actualHash = hash.digest("base64");
          const match = `sha384-${actualHash}` === expectedHash;
          resolve(match);
        });
      })
      .on("error", reject);
  });
}

// Usage
const isValid = await verifySRI(
  "https://cdn.example.com/lib.js",
  "sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC",
);

console.log("SRI Valid:", isValid);
```

## Integration with WriteCraft

### Current Architecture

- **Vite:** Bundles all assets locally
- **No CDN:** All JS/CSS served from same origin
- **CSP:** Nonce-based script execution prevents unauthorized scripts

### Future CDN Integration

If using CDN for static assets:

1. **Enable SRI in Vite Config:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Enable SRI for CDN assets
        experimentalIntegrity: true,
      },
    },
  },
});
```

2. **Update CSP Headers:**

```typescript
// Include SRI hashes in CSP
const scriptSrc = `'self' 'sha384-[HASH1]' 'sha384-[HASH2]'`;
```

3. **Configure CDN CORS:**

```
# CDN CORS headers
Access-Control-Allow-Origin: https://writecraft.com
Access-Control-Allow-Methods: GET
Access-Control-Max-Age: 86400
```

## Troubleshooting

### Issue: Resource blocked despite correct hash

**Solution:** Ensure `crossorigin="anonymous"` is present

### Issue: CORS error with SRI

**Solution:** CDN must send proper CORS headers

### Issue: Hash mismatch after deployment

**Solution:** Verify build process generates consistent hashes

### Issue: SRI breaks in development

**Solution:** Disable SRI in development, enable in production only

## References

- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [W3C SRI Specification](https://www.w3.org/TR/SRI/)
- [OWASP SRI Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Subresource_Integrity_Cheat_Sheet.html)
- [SRI Hash Generator](https://www.srihash.org/)

---

**Next Steps for WriteCraft:**

1. Monitor for external dependency additions
2. Implement automated SRI hash generation when CDN is adopted
3. Add SRI failure monitoring to security dashboard
4. Document SRI hashes in deployment checklist

**Last Review:** October 16, 2025  
**Next Review:** January 16, 2026
