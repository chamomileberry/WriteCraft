# Family Tree Junction Visual Regression Testing

## Overview

This document outlines the visual regression testing strategy for the family tree junction positioning system. The goal is to ensure that traditional genealogical T-junction patterns remain visually correct as the codebase evolves.

> **⚠️ Important**: This guide provides a **conceptual framework** and **implementation roadmap** for visual regression testing using Playwright. The test examples are illustrative and would need to be adapted to the actual family tree UI workflow. See "Current Protection Status" below for what's already implemented.

## Current Protection Status ✅

### 1. Unit Tests (Implemented)

- **Location**: `tests/junction-positioning.spec.ts`
- **Coverage**: 14 comprehensive tests covering all utility functions
- **Status**: All tests passing ✅
- **Protection**: Mathematical correctness of positioning calculations

### 2. Shared Utility Module (Implemented)

- **Location**: `client/src/lib/junction-positioning.ts`
- **Purpose**: Single source of truth for all junction positioning logic
- **Protection**: Prevents duplicate positioning code and logic drift

### 3. Runtime Validation (Implemented)

- **Location**: Built into `junction-positioning.ts` utilities
- **Behavior**: Development mode validation guards catch positioning errors
- **Protection**: Early detection of incorrect configurations

### 4. Documentation (Implemented)

- **Location**: Inline comments in `FamilyTreeEditor.tsx` and `junction-positioning.ts`
- **Purpose**: Explains the math, edge cases, and critical requirements
- **Protection**: Knowledge preservation for future developers

## Visual Regression Testing (Not Yet Implemented)

### What's Missing

Visual regression tests would verify the **rendered output** in a real browser, catching:

- Rendering bugs not caught by unit tests
- CSS/styling issues affecting junction appearance
- React Flow edge routing problems
- Browser-specific rendering differences
- Visual layout shifts from DOM changes

### Why Visual Tests Matter

Unit tests verify the math is correct, but they can't catch:

- A CSS change that makes junctions invisible
- React Flow edge renderer changes
- Incorrect z-index causing overlap issues
- Font loading affecting card dimensions
- Browser zoom affecting positioning

## Setting Up Playwright for Visual Regression

### Step 1: Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### Step 2: Create Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual-regression",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:5000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 3: Conceptual Visual Regression Tests

The following examples illustrate the **approach** for visual regression testing. These are **conceptual examples** that would need to be adapted based on the actual family tree UI implementation:

**Key Challenge**: The current family tree editor uses a complex workflow involving:

- Drag-and-drop from character gallery
- Real-time edge connections
- Dynamic junction creation
- React Flow internal state management

**Required Steps Before Implementation**:

1. Create a test data seeding endpoint (`POST /api/test/seed-family-tree`)
2. Add test-specific queries to load pre-configured family trees
3. Document exact UI interaction patterns for creating relationships
4. Handle React Flow's async rendering and state updates

**Conceptual Test Examples**:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Family Tree Junction Visual Regression", () => {
  test.beforeEach(async ({ page }) => {
    // Would need: Authentication handling
    // Would need: Test user setup
    // Would need: Notebook creation
    await page.goto("/notebooks/test-notebook-id/family-tree/test-tree-id");

    // Wait for React Flow to render
    await page.waitForSelector(".react-flow");
    await page.waitForLoadState("networkidle");
  });

  test("should render horizontal marriage line between aligned parents", async ({
    page,
  }) => {
    // ACTUAL IMPLEMENTATION REQUIRED:
    // 1. Seed test data via API with two parents of different heights
    // 2. Or use actual UI to:
    //    - Click "Add Member" button (data-testid="button-add-member")
    //    - Fill in member details
    //    - Add second member
    //    - Create relationship by dragging connection between nodes
    //    - Select "Spouse" relationship type

    // Once family tree is set up, capture visual state
    const reactFlow = page.locator(".react-flow");
    await expect(reactFlow).toHaveScreenshot("horizontal-marriage-line.png", {
      maxDiffPixels: 10,
    });
  });

  test("should render centered vertical child line from junction", async ({
    page,
  }) => {
    // ACTUAL IMPLEMENTATION REQUIRED:
    // 1. Create pre-configured family tree via test seed endpoint
    // 2. Verify junction node exists: page.locator('[data-id*="junction-"]')
    // 3. Verify child edge connects to junction center

    const junctionEdges = page.locator(".react-flow__edges");
    await expect(junctionEdges).toHaveScreenshot("centered-child-line.png", {
      maxDiffPixels: 10,
    });
  });

  test("should maintain alignment during drag", async ({ page }) => {
    // ACTUAL IMPLEMENTATION REQUIRED:
    // 1. Load family tree with married couple via seed endpoint
    // 2. Find parent node: const parent = page.locator('[data-id="member-id-1"]')
    // 3. Perform drag: await parent.dragTo(...)
    // 4. Verify spouse node moved in sync

    const reactFlow = page.locator(".react-flow");
    await expect(reactFlow).toHaveScreenshot("drag-alignment.png", {
      maxDiffPixels: 10,
    });
  });

  test("should align couples during auto-layout", async ({ page }) => {
    // ACTUAL IMPLEMENTATION REQUIRED:
    // 1. Create misaligned couple via manual positioning
    // 2. Click auto-layout: page.click('[data-testid="button-toggle-layout"]')
    // 3. Wait for layout completion: await page.waitForTimeout(500)
    // 4. Verify vertical center alignment

    // Trigger auto-layout (button exists with data-testid="button-toggle-layout")
    await page.click('[data-testid="button-toggle-layout"]');
    await page.waitForTimeout(500); // Wait for layout animation

    const reactFlow = page.locator(".react-flow");
    await expect(reactFlow).toHaveScreenshot("auto-layout-alignment.png", {
      maxDiffPixels: 50,
    });
  });

  test("should match baseline rendering with test fixtures", async ({
    page,
  }) => {
    // RECOMMENDED APPROACH:
    // 1. Create test fixture endpoint: GET /api/test/family-tree-fixtures/standard
    // 2. Load fixture data into family tree
    // 3. Compare against committed baseline screenshot

    // Example using test data injection (requires backend support):
    const response = await page.request.get(
      "/api/test/family-tree-fixtures/standard",
    );
    const fixtureData = await response.json();

    // Load fixture into editor (implementation needed)
    await page.evaluate((data) => {
      // Would need exposed test API to load data
      window.__loadTestFamilyTree?.(data);
    }, fixtureData);

    await page.waitForLoadState("networkidle");

    const reactFlow = page.locator(".react-flow");
    await expect(reactFlow).toHaveScreenshot("baseline-family-tree.png", {
      maxDiffPixels: 20,
    });
  });
});
```

### Step 4: Running Playwright Tests

**Without modifying package.json** (repository constraint), run tests using npx:

```bash
# Run all visual tests
npx playwright test tests/visual-regression

# Run with UI for debugging
npx playwright test tests/visual-regression --ui

# Update baseline screenshots (when changes are intentional)
npx playwright test tests/visual-regression --update-snapshots

# Run specific test file
npx playwright test tests/visual-regression/family-tree-junctions.spec.ts

# Run in headed mode (see browser)
npx playwright test tests/visual-regression --headed

# Debug a specific test
npx playwright test tests/visual-regression --debug
```

**Optional**: Create a separate `test.sh` script:

```bash
#!/bin/bash
# test-visual.sh

case "$1" in
  "run")
    npx playwright test tests/visual-regression
    ;;
  "ui")
    npx playwright test tests/visual-regression --ui
    ;;
  "update")
    npx playwright test tests/visual-regression --update-snapshots
    ;;
  *)
    echo "Usage: ./test-visual.sh [run|ui|update]"
    exit 1
    ;;
esac
```

Make executable: `chmod +x test-visual.sh`

### Step 5: CI/CD Integration (Conceptual)

**If implementing in CI/CD**, create `.github/workflows/visual-regression.yml`:

```yaml
name: Visual Regression Tests

on:
  pull_request:
    paths:
      - "client/src/components/FamilyTreeEditor.tsx"
      - "client/src/lib/junction-positioning.ts"
      - "client/src/components/JunctionNode.tsx"
      - "client/src/components/JunctionEdge.tsx"
      - "client/src/lib/dagre-layout.ts"

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run visual regression tests
        run: npx playwright test tests/visual-regression
        env:
          CI: true

      - name: Upload test results on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-regression-results
          path: |
            test-results/
            playwright-report/
          retention-days: 30

      - name: Upload baseline screenshots if updated
        if: success()
        uses: actions/upload-artifact@v3
        with:
          name: baseline-screenshots
          path: tests/visual-regression/**/*.png
          retention-days: 7
```

**Note**: This workflow only runs when family tree files are modified, reducing CI costs.

## Running Visual Regression Tests (Once Implemented)

### Local Development Commands

Since the repository does not allow modifying `package.json`, all Playwright commands must be run directly using `npx`:

```bash
# Run all visual regression tests (headless)
npx playwright test tests/visual-regression

# Run tests with UI for interactive debugging
npx playwright test tests/visual-regression --ui

# Update baseline screenshots when changes are intentional
npx playwright test tests/visual-regression --update-snapshots

# Run specific test file
npx playwright test tests/visual-regression/family-tree-junctions.spec.ts

# Run in headed mode (see the browser)
npx playwright test tests/visual-regression --headed

# Debug a specific test with Playwright inspector
npx playwright test tests/visual-regression --debug

# Run with trace for detailed debugging
npx playwright test tests/visual-regression --trace on
```

### Alternative: Shell Script Helper (Optional)

If you prefer shorter commands, create `test-visual.sh`:

```bash
#!/bin/bash
# test-visual.sh - Helper script for visual regression tests

case "$1" in
  "run")
    npx playwright test tests/visual-regression
    ;;
  "ui")
    npx playwright test tests/visual-regression --ui
    ;;
  "update")
    npx playwright test tests/visual-regression --update-snapshots
    ;;
  "debug")
    npx playwright test tests/visual-regression --debug
    ;;
  *)
    echo "Usage: ./test-visual.sh [run|ui|update|debug]"
    exit 1
    ;;
esac
```

Make executable: `chmod +x test-visual.sh`

Then run: `./test-visual.sh run`

### Debugging Failed Tests

When a visual test fails:

1. **View the diff**: Playwright generates diff images in `test-results/`
2. **Check the comparison**:

   - `*-actual.png`: What was rendered
   - `*-expected.png`: Baseline screenshot
   - `*-diff.png`: Highlighted differences

3. **Determine if change is expected**:

   - If intentional: Update snapshots with `npx playwright test --update-snapshots`
   - If bug: Fix the code and re-run tests with `npx playwright test`

4. **View detailed report**:
   ```bash
   npx playwright show-report
   ```

## Best Practices

### 1. Stable Test Data

- Use fixed IDs for test nodes
- Don't rely on timestamps or random data
- Create deterministic test scenarios

### 2. Visual Stability

- Wait for animations to complete
- Ensure fonts are loaded
- Account for anti-aliasing differences

### 3. Diff Tolerance

- Set `maxDiffPixels` appropriately
- Tighter tolerance for critical visual elements
- Looser tolerance for decorative elements

### 4. Screenshot Scope

- Capture specific elements, not entire pages
- Focus on the junction/edge area being tested
- Reduce flakiness from irrelevant page changes

### 5. Test Maintenance

- Review and update baselines regularly
- Document why baselines changed
- Keep test scenarios simple and focused

## Integration with Existing Tests

The visual regression tests complement the existing unit tests:

1. **Unit Tests** (`tests/junction-positioning.spec.ts`):

   - Verify mathematical correctness
   - Fast execution (milliseconds)
   - Run on every commit

2. **Visual Tests** (Playwright):

   - Verify rendered appearance
   - Slower execution (seconds)
   - Run before releases or on PR merge

3. **Manual Testing**:
   - User experience validation
   - Edge cases not covered by automation
   - Run during feature development

## Future Enhancements

### 1. Cross-Browser Testing

Add more browsers to `playwright.config.ts`:

```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
],
```

### 2. Responsive Testing

Test different viewport sizes:

```typescript
test("should render correctly on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  // ... test mobile layout
});
```

### 3. Accessibility Testing

Add a11y checks to visual tests:

```typescript
import { injectAxe, checkA11y } from "axe-playwright";

test("should meet accessibility standards", async ({ page }) => {
  await injectAxe(page);
  await checkA11y(page, ".react-flow");
});
```

### 4. Performance Monitoring

Track rendering performance:

```typescript
test("should render family tree within performance budget", async ({
  page,
}) => {
  const startTime = Date.now();
  await page.goto("/family-tree/large-tree-id");
  await page.waitForSelector(".react-flow__edge");
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(2000); // 2 second budget
});
```

## Making Tests Executable

To convert these conceptual tests into executable Playwright tests, the following infrastructure is needed:

### 1. Test Data Seeding API

Create backend endpoints for test data:

```typescript
// server/routes.ts - Test endpoints (only available in development/test)
if (process.env.NODE_ENV !== "production") {
  app.post("/api/test/seed-family-tree", async (req, res) => {
    const { treeId, members, relationships } = req.body;
    // Insert test data directly into database
    // Return created tree with all IDs
  });

  app.get("/api/test/family-tree-fixtures/:name", async (req, res) => {
    // Return predefined test fixtures (couples with different heights, etc.)
  });
}
```

### 2. Test Helper Functions

Create reusable Playwright helpers:

```typescript
// tests/helpers/family-tree-helpers.ts
export async function createTestFamilyTree(
  page: Page,
  fixture: FamilyTreeFixture,
) {
  const response = await page.request.post("/api/test/seed-family-tree", {
    data: fixture,
  });
  return await response.json();
}

export async function waitForJunctionRender(page: Page, junctionId: string) {
  await page.waitForSelector(`[data-id="${junctionId}"]`);
  await page.waitForFunction(() => {
    const junction = document.querySelector(`[data-id="${junctionId}"]`);
    return junction && junction.getBoundingClientRect().width > 0;
  });
}
```

### 3. Visual Regression Fixtures

Create standardized test fixtures:

```typescript
// tests/fixtures/family-trees.ts
export const MARRIED_COUPLE_DIFFERENT_HEIGHTS = {
  members: [
    { id: "m1", characterId: "c1", position: { x: 100, y: 100 } },
    { id: "m2", characterId: "c2", position: { x: 400, y: 100 } },
  ],
  relationships: [
    {
      type: "spouse",
      member1Id: "m1",
      member2Id: "m2",
      hasChildren: true,
    },
  ],
};
```

### 4. Authentication Handling

Add test authentication:

```typescript
// tests/helpers/auth.ts
export async function authenticateTestUser(page: Page) {
  await page.goto("/");
  // Use test-specific auth mechanism
  await page.evaluate(() => {
    localStorage.setItem("test-user-id", "test-user-123");
  });
}
```

## Current Protection Status Summary

The junction positioning system has **robust mathematical protection** but **no visual verification**:

### ✅ Implemented Protection Layers

1. **Unit Tests** (`tests/junction-positioning.spec.ts`)

   - 14 comprehensive tests
   - All positioning math validated
   - Regression protection for calculations
   - **Limitation**: Cannot catch rendering issues

2. **Shared Utility Module** (`client/src/lib/junction-positioning.ts`)

   - Single source of truth for positioning
   - Used in 3 critical locations
   - Comprehensive inline documentation
   - **Limitation**: Doesn't prevent CSS/rendering bugs

3. **Runtime Validation** (dev mode guards)

   - Automatic validation in development
   - Early error detection
   - Console warnings for issues
   - **Limitation**: Only runs in development

4. **Documentation** (inline comments + this guide)
   - Knowledge preservation
   - Implementation roadmap
   - **Limitation**: Requires manual interpretation

### ⏳ Not Yet Implemented

5. **Visual Regression Tests** (Playwright)
   - Would catch: CSS issues, edge rendering bugs, browser differences
   - Requires: Test infrastructure, fixtures, helper functions
   - Status: Conceptual framework documented, implementation TBD

## Conclusion

The junction positioning system has **strong protection against mathematical regressions** through unit tests, shared utilities, and runtime validation. However, **visual regressions** (CSS changes, React Flow rendering issues, browser incompatibilities) can only be caught with browser-based testing.

**Current State**: Production-ready positioning logic with comprehensive unit test coverage ✅  
**Future Enhancement**: Add Playwright visual tests when browser-based verification is needed ⏳

**Recommendation**: The existing protection layers are sufficient for most development workflows. Implement visual regression testing when:

- Making significant changes to React Flow integration
- Modifying CSS affecting family tree layout
- Supporting new browsers or viewport sizes
- Before major releases requiring visual QA
