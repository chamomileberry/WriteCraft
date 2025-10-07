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

  if (contentType === 'character') {
    return {
      userId,
      notebookId,
      givenName: article.title?.split(' ')[0] || '',
      familyName: article.title?.split(' ').slice(1).join(' ') || '',
      backstory: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'species') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      physicalDescription: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'location') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      locationType: 'other',
      geography: article.content || article.excerpt || '',
      description: article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'organization') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      organizationType: 'other',
      purpose: 'Imported from World Anvil',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  }

  return { userId, notebookId, contentType };
}

async function runImport() {
  try {
    const userId = '33081217';
    const notebookId = '0fe4e254-02d1-4a14-9046-6b3aefe17a89';
    
    console.log(`🚀 Starting World Anvil import\n`);
    
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
    
    console.log(`📦 Found ${articles.length} articles\n`);
    
    const results = {
      imported: [] as string[],
      failed: [] as any[],
      skipped: [] as string[],
    };
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      const mapped = mapArticleToContent(article, userId, notebookId);
      const contentType = WORLD_ANVIL_TYPE_MAPPING[article.templateType?.toLowerCase() || article.entityClass?.toLowerCase() || 'document'] || 'document';
      
      try {
        if (contentType === 'character') {
          const char = await storage.createCharacter(mapped);
          results.imported.push(char.id);
          console.log(`✓ [${i+1}/${articles.length}] Character: ${article.title}`);
        } else if (contentType === 'location') {
          const loc = await storage.createLocation(mapped);
          results.imported.push(loc.id);
          console.log(`✓ [${i+1}/${articles.length}] Location: ${article.title}`);
        } else if (contentType === 'organization') {
          const org = await storage.createOrganization(mapped);
          results.imported.push(org.id);
          console.log(`✓ [${i+1}/${articles.length}] Organization: ${article.title}`);
        } else if (contentType === 'species') {
          const spec = await storage.createSpecies(mapped);
          results.imported.push(spec.id);
          console.log(`✓ [${i+1}/${articles.length}] Species: ${article.title}`);
        } else {
          results.skipped.push(`${article.title} (${contentType})`);
        }
      } catch (error: any) {
        results.failed.push({ title: article.title, error: error.message });
        console.log(`✗ [${i+1}/${articles.length}] Failed: ${article.title} - ${error.message}`);
      }
    }
    
    console.log('\n════════════════════════════════════════════════');
    console.log('📊 Import Complete!');
    console.log('════════════════════════════════════════════════');
    console.log(`✅ Successfully imported: ${results.imported.length} items`);
    console.log(`⊘ Skipped (unsupported types): ${results.skipped.length} items`);
    console.log(`✗ Failed: ${results.failed.length} items`);
    
    if (results.imported.length > 0) {
      console.log('\n🎉 Your World Anvil content has been imported to WriteCraft!');
      console.log('   You can find it in your notebook: "The Green Tide"');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

runImport();
