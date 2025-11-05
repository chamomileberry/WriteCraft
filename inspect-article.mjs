import AdmZip from "adm-zip";

const zipPath =
  "./attached_assets/World-The Green Tide-2025-10-06_1759784760300.zip";
const zip = new AdmZip(zipPath);
const entries = zip.getEntries();

// Get a sample Person article
const personArticle = entries.find((e) =>
  e.entryName.includes("Person-Armando González"),
);
if (personArticle) {
  const data = JSON.parse(personArticle.getData().toString("utf8"));
  console.log("Sample Person Article (Armando González):");
  console.log(JSON.stringify(data, null, 2).substring(0, 1500));
  console.log("\n...(truncated)");
}

// Get a sample Species article
const speciesArticle = entries.find((e) =>
  e.entryName.includes("Species-Agave"),
);
if (speciesArticle) {
  const data = JSON.parse(speciesArticle.getData().toString("utf8"));
  console.log("\n\nSample Species Article (Agave):");
  console.log(JSON.stringify(data, null, 2).substring(0, 1500));
  console.log("\n...(truncated)");
}
