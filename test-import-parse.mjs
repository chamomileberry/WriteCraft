import AdmZip from 'adm-zip';
import { readFileSync } from 'fs';

// Test the parsing logic locally
const zipPath = './attached_assets/World-The Green Tide-2025-10-06_1759784760300.zip';
const zipBuffer = readFileSync(zipPath);

const zip = new AdmZip(zipBuffer);
const entries = zip.getEntries();

let articles = [];

// Find articles
const articlesEntry = entries.find(entry => entry.entryName.endsWith('articles.json'));
if (articlesEntry) {
  console.log('Found articles.json');
} else {
  console.log('No articles.json found, looking for individual files...');
  const articleFiles = entries.filter(entry => 
    !entry.isDirectory && 
    entry.entryName.includes('/articles/') && 
    entry.entryName.endsWith('.json')
  );
  
  console.log(`Found ${articleFiles.length} article files`);
  
  articleFiles.forEach(entry => {
    try {
      const data = JSON.parse(entry.getData().toString('utf8'));
      if (data.title || data.id || data.name) {
        articles.push(data);
      }
    } catch (e) {
      console.log(`Failed to parse ${entry.entryName}`);
    }
  });
  
  console.log(`Successfully parsed ${articles.length} articles`);
}

// Show type breakdown
const typeCount = {};
articles.forEach(art => {
  const type = art.entityClass || art.templateType || 'unknown';
  typeCount[type] = (typeCount[type] || 0) + 1;
});

console.log('\nArticle types:');
Object.entries(typeCount).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});
