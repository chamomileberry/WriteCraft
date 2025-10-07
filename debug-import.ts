import { storage } from './server/storage';
import AdmZip from 'adm-zip';
import { readFileSync } from 'fs';

async function debugImport() {
  const userId = '33081217';
  const notebookId = '0fe4e254-02d1-4a14-9046-6b3aefe17a89';
  
  // Test with a simple species article
  const zipPath = './attached_assets/World-The Green Tide-2025-10-06_1759784760300.zip';
  const zipBuffer = readFileSync(zipPath);
  const zip = new AdmZip(zipBuffer);
  
  const agaveEntry = zip.getEntries().find(e => e.entryName.includes('Species-Agave'));
  if (!agaveEntry) {
    console.log('Could not find Agave article');
    process.exit(1);
  }
  
  const article = JSON.parse(agaveEntry.getData().toString('utf8'));
  
  console.log('Article data:');
  console.log('  Title:', article.title);
  console.log('  Entity Class:', article.entityClass);
  console.log('  Template Type:', article.templateType);
  console.log('  Content length:', article.content?.length || 0);
  
  const mapped = {
    userId,
    notebookId,
    name: article.title || 'Untitled',
    description: article.content || article.excerpt || '',
  };
  
  console.log('\nMapped data:');
  console.log(JSON.stringify(mapped, null, 2).substring(0, 500));
  
  try {
    console.log('\nAttempting to create species...');
    const species = await storage.createSpecies(mapped);
    console.log('✅ Success! Created species:', species.id);
  } catch (error: any) {
    console.error('❌ Failed to create species:');
    console.error('  Error:', error.message);
    console.error('  Stack:', error.stack?.split('\n').slice(0, 3).join('\n'));
  }
  
  process.exit(0);
}

debugImport();
