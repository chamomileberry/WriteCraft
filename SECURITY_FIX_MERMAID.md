# Security Fix: Mermaid XSS Vulnerability (CVE-2025-54881)

## Summary
Fixed a critical XSS vulnerability in the mermaid.js library that affects sequence diagram labels with KaTeX delimiters.

## Vulnerability Details

### CVE-2025-54881
- **Severity**: High
- **Affected Versions**: mermaid 10.9.0-rc.1 to 11.9.0
- **Fixed Version**: mermaid 11.10.0 and later
- **Our Fix**: Upgraded to mermaid 11.12.1

### Impact
In the default configuration of mermaid 10.9.0 to 11.9.0, user supplied input for sequence diagram labels is passed to `innerHTML` during calculation of element size, causing XSS when mermaid-js is used in its default configuration (with KaTeX support enabled).

### Root Cause
The `calculateMathMLDimensions` method in mermaid was passing unsanitized text to `innerHTML`:

```javascript
export const calculateMathMLDimensions = async (text: string, config: MermaidConfig) => {
  text = await renderKatex(text, config);
  const divElem = document.createElement('div');
  divElem.innerHTML = text; // XSS sink - text has not been sanitized
  // ... rest of function
};
```

## Fix Implementation

### Solution
Since mermaid is a transitive dependency through `@excalidraw/excalidraw` and upgrading the parent package would cause breaking changes, we used **npm overrides** to force a secure version of mermaid.

### Changes Made

#### package.json
Added the following override to force mermaid to version 11.10.0 or later:

```json
{
  "overrides": {
    "mermaid": "^11.10.0"
  }
}
```

This ensures that all packages that depend on mermaid (including `@excalidraw/mermaid-to-excalidraw`) use the secure version.

#### Verification
After running `npm install --legacy-peer-deps`, the dependency tree now shows:

```
@excalidraw/excalidraw@0.18.0
└── @excalidraw/mermaid-to-excalidraw@1.1.2
    └── mermaid@11.12.1 overridden
```

## Testing

To verify the fix works:

1. Check installed version:
   ```bash
   npm list mermaid
   ```
   Should show: `mermaid@11.12.1 overridden`

2. Verify package-lock.json:
   ```bash
   grep -A 3 '"node_modules/mermaid":' package-lock.json
   ```
   Should show version 11.12.1

## Additional Context

### Why Not Upgrade @excalidraw/excalidraw?
- Version 0.18.0 is already the latest stable version
- The issue is in the transitive dependency `@excalidraw/mermaid-to-excalidraw` which depends on the vulnerable mermaid version
- Using npm overrides is the recommended approach for this scenario

### Installation Notes
Due to peer dependency conflicts with other packages, you must use:
```bash
npm install --legacy-peer-deps
```

## References
- CVE-2025-54881: Mermaid Sequence Diagram XSS Vulnerability
- Fixed in: https://github.com/mermaid-js/mermaid/releases (v11.10.0+)
- Introduced in: commit 5c69e5fdb004a6d0a2abe97e23d26e223a059832 (v10.9.0)

## Date
Fixed: 2025-10-29
