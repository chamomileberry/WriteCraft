import { test, expect } from "@playwright/test";

test("Import World Anvil ZIP file", async ({ page }) => {
  // Navigate to home and check if already logged in
  await page.goto("/");

  // Check if we need to login
  const loginButton = page.getByTestId("button-login");
  const isLoggedOut = await loginButton.isVisible().catch(() => false);

  if (isLoggedOut) {
    console.log("Not logged in, skipping import test");
    return;
  }

  // Navigate to import page
  await page.goto("/import");
  await page.waitForLoadState("networkidle");

  console.log("📦 Uploading World Anvil ZIP file...");

  // Upload the ZIP file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(
    "./attached_assets/World-The Green Tide-2025-10-06_1759784760300.zip",
  );

  // Wait a bit for file to be selected
  await page.waitForTimeout(500);

  // Click upload button
  const uploadButton = page.getByTestId("button-upload-import");
  await uploadButton.click();

  console.log("⏳ Waiting for import to start...");

  // Wait for import to start (toast message)
  await expect(page.getByText("Import started", { exact: false })).toBeVisible({
    timeout: 10000,
  });

  console.log("✅ Import job started successfully!");

  // Wait for import to complete (up to 2 minutes)
  console.log("📊 Monitoring import progress...");

  // Look for completion status
  const completedBadge = page.getByText("Completed", { exact: false });
  await expect(completedBadge).toBeVisible({ timeout: 120000 });

  console.log("✅ Import completed!");

  // Get the import job details
  const jobCard = page.locator('[data-testid^="import-job"]').first();
  const jobText = await jobCard.textContent();
  console.log("Import details:", jobText);
});
