import { db } from './server/db.js';
import { storage } from './server/storage.js';
import AdmZip from 'adm-zip';
import { readFileSync } from 'fs';

const WORLD_ANVIL_TYPE_MAPPING = {
  'character': 'character',
  'person': 'character',
  'location': 'location',
  'geography': 'location',
  'settlement': 'settlement',
  'building': 'building',
  'organization': 'organization',
  'ethnicity': 'ethnicity',
  'species': 'species',
  'race': 'species',
  'item': 'item',
  'vehicle': 'transportation',
  'document': 'document',
  'language': 'language',
  'religion': 'religion',
  'tradition': 'tradition',
  'ritual': 'ritual',
  'military': 'militaryunit',
  'myth': 'myth',
  'legend': 'legend',
  'condition': 'condition',
  'material': 'material',
  'technology': 'technology',
  'spell': 'spell',
  'law': 'law',
  'plot': 'plot',
  'event': 'event',
  'timeline': 'timeline',
  'prose': 'document',
  'article': 'document',
  'profession': 'document',
  'rank': 'document',
  'landmark': 'location',
};

function mapArticleToContent(article, userId, notebookId) {
  let typeKey = '';
  
  if (article.templateType) {
    typeKey = article.templateType.toLowerCase();
  } else if (article.entityClass) {
    typeKey = article.entityClass.toLowerCase();
  } else {
    typeKey = 'document';
  }
  
  const contentType = WORLD_ANVIL_TYPE_MAPPING[typeKey] || 'document';

  const baseContent = {
    userId,
    notebookId,
    name: article.title || 'Untitled',
    description: article.content || article.excerpt || '',
  };

  if (contentType === 'character') {
    return {
      ...baseContent,
      givenName: article.title?.split(' ')[0] || '',
      familyName: article.title?.split(' ').slice(1).join(' ') || '',
      backstory: article.content || article.excerpt || '',
    };
  }

  return { ...baseContent, contentType };
}

async function doDirectImport() {
  try {
    // Get your user ID (you're logged in as chamomileberry525@...)
    const userId = '33081217'; // From the logs
    
    console.log(`🔍 Importing for user ID: ${userId}`);
    
    // Get or create notebook
    let notebooks = await storage.getUserNotebooks(userId);
    let notebookId;
    
    if (notebooks.length > 0) {
      notebookId = notebooks[0].id;
      console.log(`✓ Using existing notebook: ${notebooks[0].name}`);
    } else {
      const notebook = await storage.createNotebook({
        userId,
        name: 'The Green Tide',
        description: 'World imported from World Anvil',
      });
      notebookId = notebook.id;
      console.log(`✓ Created new notebook: ${notebook.name}`);
    }
    
    // Parse ZIP
    const zipPath = './attached_assets/World-The Green Tide-2025-10-06_1759784760300.zip';
    const zipBuffer = readFileSync(zipPath);
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();
    
    const articles = [];
    const articleFiles = entries.filter(entry => 
      !entry.isDirectory && 
      entry.entryName.includes('/articles/') && 
      entry.entryName.endsWith('.json')
    );
    
    articleFiles.forEach(entry => {
      try {
        const data = JSON.parse(entry.getData().toString('utf8'));
        if (data.title || data.id || data.name) {
          articles.push(data);
        }
      } catch (e) {
        // Skip
      }
    });
    
    console.log(`\n📦 Found ${articles.length} articles to import\n`);
    
    const results = {
      imported: [],
      failed: [],
      skipped: [],
    };
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const mapped = mapArticleToContent(article, userId, notebookId);
      const contentType = mapped.contentType || 'document';
      
      try {
        if (contentType === 'character') {
          const character = await storage.createCharacter({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(character.id);
          console.log(`✓ [${i+1}/${articles.length}] Created character: ${article.title}`);
        } else if (contentType === 'location') {
          const location = await storage.createLocation({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(location.id);
          console.log(`✓ [${i+1}/${articles.length}] Created location: ${article.title}`);
        } else if (contentType === 'organization') {
          const org = await storage.createOrganization({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(org.id);
          console.log(`✓ [${i+1}/${articles.length}] Created organization: ${article.title}`);
        } else if (contentType === 'species') {
          const species = await storage.createSpecies({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(species.id);
          console.log(`✓ [${i+1}/${articles.length}] Created species: ${article.title}`);
        } else {
          results.skipped.push(`${article.title} (${contentType})`);
          console.log(`⊘ [${i+1}/${articles.length}] Skipped (type: ${contentType}): ${article.title}`);
        }
      } catch (error) {
        results.failed.push({ title: article.title, error: error.message });
        console.log(`✗ [${i+1}/${articles.length}] Failed: ${article.title} - ${error.message}`);
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`   ✅ Imported: ${results.imported.length}`);
    console.log(`   ⊘ Skipped: ${results.skipped.length}`);
    console.log(`   ✗ Failed: ${results.failed.length}`);
    
    if (results.skipped.length > 0) {
      console.log('\n   Skipped types:');
      const skippedTypes = {};
      results.skipped.forEach(item => {
        const type = item.match(/\(([^)]+)\)/)?.[1] || 'unknown';
        skippedTypes[type] = (skippedTypes[type] || 0) + 1;
      });
      Object.entries(skippedTypes).forEach(([type, count]) => {
        console.log(`     - ${type}: ${count}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

doDirectImport();
