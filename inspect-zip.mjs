import AdmZip from "adm-zip";

const zipPath =
  "./attached_assets/World-The Green Tide-2025-10-06_1759784760300.zip";
const zip = new AdmZip(zipPath);
const entries = zip.getEntries();

console.log(`Total entries in ZIP: ${entries.length}\n`);
console.log("Files:");
entries.forEach((entry) => {
  if (!entry.isDirectory) {
    const sizeKB = (entry.header.size / 1024).toFixed(2);
    console.log(`  ${entry.entryName} (${sizeKB} KB)`);
  }
});

// Check for manifest and articles
const manifestEntry = entries.find((e) =>
  e.entryName.endsWith("manifest.json"),
);
const articlesEntry = entries.find((e) =>
  e.entryName.endsWith("articles.json"),
);

if (manifestEntry) {
  console.log("\n✓ Found manifest.json");
  const manifest = JSON.parse(manifestEntry.getData().toString("utf8"));
  console.log("  World:", manifest.world?.title || "Unknown");
}

if (articlesEntry) {
  console.log("\n✓ Found articles.json");
  const articlesData = JSON.parse(articlesEntry.getData().toString("utf8"));
  const articles = Array.isArray(articlesData)
    ? articlesData
    : articlesData.articles || [];
  console.log(`  Total articles: ${articles.length}`);

  if (articles.length > 0) {
    console.log("\n  Sample articles:");
    articles.slice(0, 5).forEach((art) => {
      const type = art.entityClass || art.templateType || "unknown";
      console.log(`    - ${art.title} (${type})`);
    });
  }
}
