import { storage } from './server/storage';
import AdmZip from 'adm-zip';
import { readFileSync } from 'fs';

const WORLD_ANVIL_TYPE_MAPPING: { [key: string]: string } = {
  'character': 'character',
  'person': 'character',
  'location': 'location',
  'settlement': 'settlement',
  'ethnicity': 'ethnicity',
  'species': 'species',
  'item': 'item',
  'organization': 'organization',
  'profession': 'document',
  'rank': 'document',
  'landmark': 'location',
  'document': 'document',
  'language': 'language',
  'ritual': 'ritual',
  'law': 'law',
  'condition': 'condition',
};

function mapArticleToContent(article: any, userId: string, notebookId: string) {
  let typeKey = '';
  
  if (article.templateType) {
    typeKey = article.templateType.toLowerCase();
  } else if (article.entityClass) {
    typeKey = article.entityClass.toLowerCase();
  } else {
    typeKey = 'document';
  }
  
  const contentType = WORLD_ANVIL_TYPE_MAPPING[typeKey] || 'document';

  const baseContent: any = {
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

async function runImport() {
  try {
    const userId = '33081217'; // Your user ID from logs
    
    console.log(`🔍 Starting import for user: ${userId}\n`);
    
    // Get or create notebook
    const notebooks = await storage.getUserNotebooks(userId);
    let notebookId: string;
    
    if (notebooks.length > 0) {
      notebookId = notebooks[0].id;
      console.log(`✓ Using notebook: "${notebooks[0].name}" (${notebookId})`);
    } else {
      const notebook = await storage.createNotebook({
        userId,
        name: 'The Green Tide',
        description: 'Imported from World Anvil',
      });
      notebookId = notebook.id;
      console.log(`✓ Created notebook: "${notebook.name}" (${notebookId})`);
    }
    
    // Parse ZIP
    const zipPath = './attached_assets/World-The Green Tide-2025-10-06_1759784760300.zip';
    const zipBuffer = readFileSync(zipPath);
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();
    
    const articles: any[] = [];
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
    
    console.log(`\n📦 Found ${articles.length} articles\n`);
    
    const results = {
      imported: [] as string[],
      failed: [] as any[],
      skipped: [] as string[],
    };
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const mapped = mapArticleToContent(article, userId, notebookId);
      const contentType = mapped.contentType || 'document';
      
      try {
        if (contentType === 'character') {
          const char = await storage.createCharacter({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(char.id);
          console.log(`✓ [${i+1}/${articles.length}] Character: ${article.title}`);
        } else if (contentType === 'location') {
          const loc = await storage.createLocation({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(loc.id);
          console.log(`✓ [${i+1}/${articles.length}] Location: ${article.title}`);
        } else if (contentType === 'organization') {
          const org = await storage.createOrganization({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(org.id);
          console.log(`✓ [${i+1}/${articles.length}] Organization: ${article.title}`);
        } else if (contentType === 'species') {
          const spec = await storage.createSpecies({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(spec.id);
          console.log(`✓ [${i+1}/${articles.length}] Species: ${article.title}`);
        } else {
          results.skipped.push(`${article.title} (${contentType})`);
          console.log(`⊘ [${i+1}/${articles.length}] Skipped (${contentType}): ${article.title}`);
        }
      } catch (error: any) {
        results.failed.push({ title: article.title, error: error.message });
        console.log(`✗ [${i+1}/${articles.length}] Failed: ${article.title}`);
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('📊 Import Summary');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Imported: ${results.imported.length} items`);
    console.log(`⊘ Skipped: ${results.skipped.length} items`);
    console.log(`✗ Failed: ${results.failed.length} items`);
    
    if (results.skipped.length > 0) {
      const skippedTypes: any = {};
      results.skipped.forEach(item => {
        const type = item.match(/\(([^)]+)\)/)?.[1] || 'unknown';
        skippedTypes[type] = (skippedTypes[type] || 0) + 1;
      });
      console.log('\nSkipped content types:');
      Object.entries(skippedTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

runImport();
