import { Router } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import { storage } from '../storage';
import { z } from 'zod';
import { insertImportJobSchema } from '@shared/schema';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  },
});

// World Anvil content type mapping to WriteCraft types
const WORLD_ANVIL_TYPE_MAPPING: { [key: string]: string } = {
  'character': 'character',
  'person': 'character',
  'location': 'location',
  'geography': 'location',
  'landmark': 'location',
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
  'profession': 'profession',
  'rank': 'rank',
  'transportation': 'transportation',
};

interface WorldAnvilArticle {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  category?: any; // Category is an object with id, title, etc.
  templateType?: string;
  entityClass?: string;
  state?: string;
  tags?: string | string[];
  [key: string]: any;
}

// Parse World Anvil export and map to WriteCraft structure
function parseWorldAnvilExport(zipBuffer: Buffer) {
  try {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();

    console.log(`[ZIP Parse] ZIP contains ${zipEntries.length} total entries`);
    console.log('[ZIP Parse] Entry structure:');
    const entrySample = zipEntries.slice(0, 10).map(e => e.entryName);
    console.log('[ZIP Parse] First 10 entries:', entrySample);

    let manifestData: any = null;
    const articles: WorldAnvilArticle[] = [];

    // Find and parse manifest.json
    const manifestEntry = zipEntries.find(entry => entry.entryName.endsWith('manifest.json'));
    if (manifestEntry) {
      try {
        manifestData = JSON.parse(manifestEntry.getData().toString('utf8'));
      } catch (e) {
        console.log('Could not parse manifest.json');
      }
    }

    // Find and parse articles.json or individual article files
    const articlesEntry = zipEntries.find(entry => entry.entryName.endsWith('articles.json'));
    if (articlesEntry) {
      try {
        const articlesData = JSON.parse(articlesEntry.getData().toString('utf8'));
        if (Array.isArray(articlesData)) {
          console.log(`[ZIP Parse] Found ${articlesData.length} articles in articles.json (array format)`);
          articles.push(...articlesData);
        } else if (articlesData.articles && Array.isArray(articlesData.articles)) {
          console.log(`[ZIP Parse] Found ${articlesData.articles.length} articles in articles.json (object format)`);
          articles.push(...articlesData.articles);
        } else {
          console.log('[ZIP Parse] articles.json exists but has unexpected format:', Object.keys(articlesData));
        }
      } catch (e) {
        console.log('[ZIP Parse] Could not parse articles.json:', e instanceof Error ? e.message : 'Unknown error');
      }
    } else {
      console.log('[ZIP Parse] No articles.json found in ZIP');
    }

    // If no articles.json, look for individual JSON files
    if (articles.length === 0) {
      console.log('[ZIP Parse] Looking for individual article files...');
      const articleFiles = zipEntries.filter(entry => 
        !entry.isDirectory && 
        entry.entryName.includes('/articles/') && 
        entry.entryName.endsWith('.json')
      );

      console.log(`[ZIP Parse] Found ${articleFiles.length} individual article files`);

      let parsed = 0;
      let failed = 0;
      articleFiles.forEach(entry => {
        try {
          const data = JSON.parse(entry.getData().toString('utf8'));
          if (data.title || data.id || data.name) {
            articles.push(data);
            parsed++;
          } else {
            console.log(`[ZIP Parse] Skipping ${entry.entryName} - no title/id/name field`);
          }
        } catch (e) {
          failed++;
          console.log(`[ZIP Parse] Could not parse ${entry.entryName}:`, e instanceof Error ? e.message : 'Unknown error');
        }
      });

      console.log(`[ZIP Parse] Successfully parsed ${parsed} articles, failed to parse ${failed} files`);
    }

    console.log(`[ZIP Parse] TOTAL ARTICLES FOUND: ${articles.length}`);

    return {
      manifest: manifestData,
      articles,
      totalItems: articles.length,
    };
  } catch (error) {
    console.error('Failed to parse ZIP file:', error);
    throw new Error('Failed to parse ZIP file');
  }
}

// Map World Anvil article to WriteCraft content
function mapArticleToContent(article: WorldAnvilArticle, userId: string, notebookId: string) {
  // World Anvil uses entityClass (e.g., "Character", "Species") or templateType (e.g., "character", "species")
  // Category is an object, not a string!
  let typeKey = '';

  if (article.templateType) {
    typeKey = article.templateType.toLowerCase();
  } else if (article.entityClass) {
    typeKey = article.entityClass.toLowerCase();
  } else if (article.category && typeof article.category === 'object' && article.category.title) {
    typeKey = article.category.title.toLowerCase();
  } else {
    typeKey = 'document';
  }

  const contentType = WORLD_ANVIL_TYPE_MAPPING[typeKey] || 'document';

  // Log unmapped types to help debug
  if (!WORLD_ANVIL_TYPE_MAPPING[typeKey] && typeKey !== 'document') {
    console.log(`[Type Mapping] Unmapped type "${typeKey}" for article "${article.title}" - defaulting to document`);
  }

  // Base fields all content types have
  const baseContent: any = {
    userId,
    notebookId,
    name: article.title || 'Untitled',
    description: article.content || article.excerpt || '',
  };

  // Add type-specific fields with required fields
  if (contentType === 'character') {
    return {
      ...baseContent,
      givenName: article.title?.split(' ')[0] || '',
      familyName: article.title?.split(' ').slice(1).join(' ') || '',
      backstory: article.content || article.excerpt || '',
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
  } else if (contentType === 'profession') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'ethnicity') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      culturalTraits: article.content || article.excerpt || '',
    };
  } else if (contentType === 'settlement') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      settlementType: 'town',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'ritual') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      ritualType: 'other',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'law') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      lawType: 'regulation',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'item') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      itemType: 'other',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'document') {
    // Documents need title at the root level, not nested
    return {
      userId,
      notebookId,
      title: article.title || article.name || 'Untitled',
      documentType: 'article',
      content: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'language') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'building') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      buildingType: 'other',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'material') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      materialType: 'other',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'transportation') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      transportationType: 'other',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'rank') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      rankType: 'other',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  } else if (contentType === 'condition') {
    return {
      userId,
      notebookId,
      name: article.title || 'Untitled',
      conditionType: 'other',
      description: article.content || article.excerpt || 'Imported from World Anvil',
    };
  }

  return { ...baseContent, contentType };
}

// Upload and start import job
router.post('/upload', upload.single('file'), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get or create a default notebook for imports
    let notebookId = req.body.notebookId;
    if (!notebookId) {
      // Get user's notebooks, use first one or create a default import notebook
      const notebooks = await storage.getUserNotebooks(userId);
      if (notebooks.length > 0) {
        notebookId = notebooks[0].id;
      } else {
        // Create a default import notebook
        const defaultNotebook = await storage.createNotebook({
          userId,
          name: 'Imported Content',
          description: 'Content imported from World Anvil',
        });
        notebookId = defaultNotebook.id;
      }
    }

    // Parse the ZIP file
    const parsed = parseWorldAnvilExport(req.file.buffer);

    // Create import job
    const job = await storage.createImportJob({
      userId,
      notebookId,
      source: 'world_anvil',
      status: 'pending',
      totalItems: parsed.totalItems,
      processedItems: 0,
      progress: 0,
    });

    // Start processing in background
    processImport(job.id, parsed, userId, notebookId).catch(console.error);

    res.json({
      jobId: job.id,
      totalItems: parsed.totalItems,
      status: 'processing',
    });
  } catch (error) {
    console.error('Import start error:', error);
    res.status(500).json({
      error: 'Failed to start import'
    });
  }
});

// Process import in background
async function processImport(
  jobId: string,
  parsed: { articles: WorldAnvilArticle[]; totalItems: number },
  userId: string,
  notebookId: string
) {
  const results = {
    imported: [] as string[],
    failed: [] as Array<{ title: string; error: string }>,
    skipped: [] as string[],
  };

  try {
    await storage.updateImportJob(jobId, { status: 'processing' });
    console.log(`[Import ${jobId}] Starting import of ${parsed.totalItems} articles`);

    for (let i = 0; i < parsed.articles.length; i++) {
      const article = parsed.articles[i];

      try {
        const mapped = mapArticleToContent(article, userId, notebookId);
        const contentType = mapped.contentType || 'document';

        console.log(`[Import ${jobId}] Processing ${i + 1}/${parsed.totalItems}: "${article.title}" (type: ${article.entityClass || article.templateType} → ${contentType})`);

        // Import based on content type
        let createdItem: any = null;

        if (contentType === 'character') {
          createdItem = await storage.createCharacter(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created character: ${article.title}`);
        } else if (contentType === 'location') {
          createdItem = await storage.createLocation(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created location: ${article.title}`);
        } else if (contentType === 'organization') {
          createdItem = await storage.createOrganization(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created organization: ${article.title}`);
        } else if (contentType === 'species') {
          createdItem = await storage.createSpecies(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created species: ${article.title}`);
        } else if (contentType === 'profession') {
          createdItem = await storage.createProfession(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created profession: ${article.title}`);
        } else if (contentType === 'ethnicity') {
          createdItem = await storage.createEthnicity(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created ethnicity: ${article.title}`);
        } else if (contentType === 'settlement') {
          createdItem = await storage.createSettlement(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created settlement: ${article.title}`);
        } else if (contentType === 'ritual') {
          createdItem = await storage.createRitual(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created ritual: ${article.title}`);
        } else if (contentType === 'law') {
          createdItem = await storage.createLaw(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created law: ${article.title}`);
        } else if (contentType === 'item') {
          createdItem = await storage.createItem(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created item: ${article.title}`);
        } else if (contentType === 'document') {
          createdItem = await storage.createDocument(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created document: ${article.title}`);
        } else if (contentType === 'language') {
          createdItem = await storage.createLanguage(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created language: ${article.title}`);
        } else if (contentType === 'building') {
          createdItem = await storage.createBuilding(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created building: ${article.title}`);
        } else if (contentType === 'material') {
          createdItem = await storage.createMaterial(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created material: ${article.title}`);
        } else if (contentType === 'transportation') {
          createdItem = await storage.createTransportation(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created transportation: ${article.title}`);
        } else if (contentType === 'rank') {
          createdItem = await storage.createRank(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created rank: ${article.title}`);
        } else if (contentType === 'condition') {
          createdItem = await storage.createCondition(mapped as any);
          results.imported.push(createdItem.id);
          console.log(`[Import ${jobId}] ✓ Created condition: ${article.title}`);
        } else {
          // Skip unsupported types for now
          const skipReason = `${article.title} (type: ${contentType}, original: ${article.templateType || article.entityClass || 'unknown'})`;
          results.skipped.push(skipReason);
          console.log(`[Import ${jobId}] ⊘ Skipped (unsupported type): ${skipReason}`);
        }

        // Create saved_items entry for notebook visibility
        if (createdItem) {
          try {
            const savedItem = await storage.saveItem({
              userId,
              notebookId,
              itemType: contentType,
              itemId: createdItem.id,
              itemData: createdItem
            });
            console.log(`[Import ${jobId}] ✓ Created saved_item ${savedItem.id} for ${contentType} "${article.title}" in notebook ${notebookId}`);
          } catch (saveError) {
            console.error(`[Import ${jobId}] ✗ Failed to create saved_item for ${contentType} "${article.title}":`, saveError);
            // Don't fail the whole import, but log it
          }
        }

        // Update progress every 10 items or on last item
        if ((i + 1) % 10 === 0 || i === parsed.totalItems - 1) {
          const progress = Math.round(((i + 1) / parsed.totalItems) * 100);
          await storage.updateImportJob(jobId, {
            processedItems: i + 1,
            progress,
          });
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.failed.push({
          title: article.title || 'Untitled',
          error: errorMsg,
        });
        console.error(`[Import ${jobId}] ✗ Failed: ${article.title} - ${errorMsg}`);
      }
    }

    console.log(`[Import ${jobId}] Completed: ${results.imported.length} imported, ${results.skipped.length} skipped, ${results.failed.length} failed`);

    // Mark as completed
    await storage.updateImportJob(jobId, {
      status: 'completed',
      progress: 100,
      results,
      completedAt: new Date(),
    });

    console.log(`[Import ${jobId}] Import job completed and marked as completed in database`);
  } catch (error) {
    await storage.updateImportJob(jobId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });
  }
}

// Get import job status
router.get('/status/:jobId', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { jobId } = req.params;

    const job = await storage.getImportJob(jobId, userId);

    if (!job) {
      return res.status(404).json({ error: 'Import job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Import status error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get import status'
    });
  }
});

// Get all import jobs for user
router.get('/history', async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const jobs = await storage.getUserImportJobs(userId);
    res.json(jobs);
  } catch (error) {
    console.error('Import history error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get import history'
    });
  }
});

export default router;