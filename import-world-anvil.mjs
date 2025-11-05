import { readFileSync } from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

const zipPath =
  "./attached_assets/World-The Green Tide-2025-10-06_1759784760300.zip";
const zipBuffer = readFileSync(zipPath);

const formData = new FormData();
formData.append("file", zipBuffer, {
  filename: "world-anvil-export.zip",
  contentType: "application/zip",
});

// Note: This will need a valid session cookie to work
// For now, let's just test the parsing logic
console.log(`ZIP file loaded: ${(zipBuffer.length / 1024).toFixed(2)} KB`);
console.log("Ready to import to /api/import/upload endpoint");
