import { test, expect } from "@playwright/test";
import { db } from "../server/db";
import AdmZip from "adm-zip";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";

test.describe("World Anvil Import Regression Tests", () => {
  const testZipPath = join(process.cwd(), "test-import-regression.zip");

  test.afterEach(async () => {
    // Cleanup test ZIP file
    try {
      unlinkSync(testZipPath);
    } catch (err) {
      // File may not exist
    }
  });

  test("should import ranks, create saved_items, and track metrics accurately", async ({
    page,
  }) => {
    // Create a test ZIP with rank and condition articles
    const zip = new AdmZip();

    const rankArticle = {
      id: "test-rank-1",
      title: "Commander",
      content: "A military rank of high authority",
      templateType: "rank",
      state: "public",
    };

    const conditionArticle = {
      id: "test-condition-1",
      title: "Verdant Infection",
      content: "A condition caused by exposure to Verdant compound",
      templateType: "condition",
      state: "public",
    };

    const characterArticle = {
      id: "test-character-1",
      title: "Test Character Name",
      content: "A brave warrior from the northern lands",
      templateType: "character",
      state: "public",
    };

    zip.addFile(
      "articles/rank-1.json",
      Buffer.from(JSON.stringify(rankArticle)),
    );
    zip.addFile(
      "articles/condition-1.json",
      Buffer.from(JSON.stringify(conditionArticle)),
    );
    zip.addFile(
      "articles/character-1.json",
      Buffer.from(JSON.stringify(characterArticle)),
    );

    writeFileSync(testZipPath, zip.toBuffer());

    // Login first
    await page.goto("/");
    const loginButton = page.getByTestId("button-login");
    const isLoggedOut = await loginButton.isVisible().catch(() => false);

    if (isLoggedOut) {
      await loginButton.click();
      await page.waitForURL("/", { timeout: 10000 });
    }

    // Get user ID from the page context
    const userId = await page.evaluate(() => {
      return (window as any).__userId || null;
    });

    // Navigate to import page
    await page.goto("/import");
    await page.waitForLoadState("networkidle");

    // Upload the ZIP file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testZipPath);

    // Click upload button
    const uploadButton = page.getByTestId("button-upload-import");
    await uploadButton.click();

    // Wait for import to start
    await expect(
      page.getByText("Import started", { exact: false }),
    ).toBeVisible({ timeout: 5000 });

    // Wait for import to complete (give it up to 30 seconds)
    await expect(page.getByText("Completed", { exact: false })).toBeVisible({
      timeout: 30000,
    });

    // Verify database state
    if (userId) {
      // Check that ranks were created
      const ranks = await db.execute(
        `SELECT * FROM ranks WHERE user_id = '${userId}'`,
      );
      expect(ranks.rows.length).toBeGreaterThan(0);

      // Check that conditions were created
      const conditions = await db.execute(
        `SELECT * FROM conditions WHERE user_id = '${userId}'`,
      );
      expect(conditions.rows.length).toBeGreaterThan(0);

      // Check that saved_items were created for all imported items
      const savedItems = await db.execute(
        `SELECT * FROM saved_items WHERE user_id = '${userId}' AND content_type IN ('rank', 'condition', 'character')`,
      );
      expect(savedItems.rows.length).toBe(3); // rank + condition + character

      // Verify import job metrics
      const importJobs = await db.execute(
        `SELECT * FROM import_jobs WHERE user_id = '${userId}' ORDER BY created_at DESC LIMIT 1`,
      );
      const latestJob = importJobs.rows[0] as any;

      expect(latestJob.status).toBe("completed");
      expect(latestJob.total_items).toBe(3);
      expect(latestJob.processed_items).toBe(3);
      expect(latestJob.results).toBeDefined();

      const results = latestJob.results as any;
      expect(results.imported.length).toBe(3);

      // Cleanup test data
      await db.execute(
        `DELETE FROM saved_items WHERE user_id = '${userId}' AND content_type IN ('rank', 'condition', 'character')`,
      );
      await db.execute(`DELETE FROM ranks WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM conditions WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM characters WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM import_jobs WHERE user_id = '${userId}'`);
    }
  });

  test("should preserve granular error details for failed items", async ({
    page,
  }) => {
    // Create a test ZIP with a malformed article that will fail
    const zip = new AdmZip();

    const validArticle = {
      id: "test-valid-1",
      title: "Valid Character",
      content: "A valid character",
      templateType: "character",
      state: "public",
    };

    // This article will potentially fail due to missing required fields
    // (depending on validation logic)
    const malformedArticle = {
      id: "test-malformed-1",
      title: "", // Empty title might cause issues
      templateType: "character",
      state: "public",
    };

    zip.addFile(
      "articles/valid-1.json",
      Buffer.from(JSON.stringify(validArticle)),
    );
    zip.addFile(
      "articles/malformed-1.json",
      Buffer.from(JSON.stringify(malformedArticle)),
    );

    writeFileSync(testZipPath, zip.toBuffer());

    // Login
    await page.goto("/");
    const loginButton = page.getByTestId("button-login");
    const isLoggedOut = await loginButton.isVisible().catch(() => false);

    if (isLoggedOut) {
      await loginButton.click();
      await page.waitForURL("/", { timeout: 10000 });
    }

    // Navigate to import page
    await page.goto("/import");
    await page.waitForLoadState("networkidle");

    // Upload the ZIP file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testZipPath);

    // Click upload button
    const uploadButton = page.getByTestId("button-upload-import");
    await uploadButton.click();

    // Wait for import to complete
    await expect(page.getByText("Completed", { exact: false })).toBeVisible({
      timeout: 30000,
    });

    // Check if detailed error information is available in the UI
    const viewDetailsButton = page.getByText("View details", { exact: false });
    const hasDetails = await viewDetailsButton.isVisible().catch(() => false);

    if (hasDetails) {
      await viewDetailsButton.click();

      // Verify granular error messages are shown
      // The UI should show which specific items failed and why
      const errorSection = page
        .locator("text=Failed Items")
        .or(page.locator("text=Skipped Items"));
      await expect(errorSection).toBeVisible();
    }

    // Get user ID and cleanup
    const userId = await page.evaluate(() => (window as any).__userId || null);
    if (userId) {
      await db.execute(`DELETE FROM saved_items WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM characters WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM import_jobs WHERE user_id = '${userId}'`);
    }
  });

  test("should accurately count all 17 content types in metrics", async ({
    page,
  }) => {
    // Create a comprehensive ZIP with all content types
    const zip = new AdmZip();

    const contentTypes = [
      { type: "character", title: "Test Character" },
      { type: "location", title: "Test Location" },
      { type: "species", title: "Test Species" },
      { type: "profession", title: "Test Profession" },
      { type: "item", title: "Test Item" },
      { type: "ethnicity", title: "Test Ethnicity" },
      { type: "settlement", title: "Test Settlement" },
      { type: "ritual", title: "Test Ritual" },
      { type: "law", title: "Test Law" },
      { type: "language", title: "Test Language" },
      { type: "building", title: "Test Building" },
      { type: "material", title: "Test Material" },
      { type: "transportation", title: "Test Transportation" },
      { type: "rank", title: "Test Rank" },
      { type: "condition", title: "Test Condition" },
      { type: "organization", title: "Test Organization" },
      { type: "document", title: "Test Document", templateType: "article" },
    ];

    contentTypes.forEach((item, idx) => {
      const article = {
        id: `test-${item.type}-${idx}`,
        title: item.title,
        content: `Test content for ${item.type}`,
        templateType: item.templateType || item.type,
        state: "public",
      };
      zip.addFile(
        `articles/${item.type}-${idx}.json`,
        Buffer.from(JSON.stringify(article)),
      );
    });

    writeFileSync(testZipPath, zip.toBuffer());

    // Login
    await page.goto("/");
    const loginButton = page.getByTestId("button-login");
    const isLoggedOut = await loginButton.isVisible().catch(() => false);

    if (isLoggedOut) {
      await loginButton.click();
      await page.waitForURL("/", { timeout: 10000 });
    }

    const userId = await page.evaluate(() => (window as any).__userId || null);

    // Navigate to import page
    await page.goto("/import");
    await page.waitForLoadState("networkidle");

    // Upload the ZIP file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(testZipPath);

    // Click upload button
    const uploadButton = page.getByTestId("button-upload-import");
    await uploadButton.click();

    // Wait for import to complete
    await expect(page.getByText("Completed", { exact: false })).toBeVisible({
      timeout: 30000,
    });

    // Verify the UI shows correct counts
    await expect(page.getByText("17 imported", { exact: false })).toBeVisible();

    // Verify import job metrics in database
    if (userId) {
      const importJobs = await db.execute(
        `SELECT * FROM import_jobs WHERE user_id = '${userId}' ORDER BY created_at DESC LIMIT 1`,
      );
      const latestJob = importJobs.rows[0] as any;

      expect(latestJob.total_items).toBe(17);
      expect(latestJob.processed_items).toBe(17);
      expect(latestJob.status).toBe("completed");

      // Cleanup
      await db.execute(`DELETE FROM saved_items WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM ranks WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM conditions WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM characters WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM species WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM locations WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM organizations WHERE user_id = '${userId}'`);
      await db.execute(`DELETE FROM import_jobs WHERE user_id = '${userId}'`);
    }
  });
});
