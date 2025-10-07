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
          articles.push(...articlesData);
        } else if (articlesData.articles && Array.isArray(articlesData.articles)) {
          articles.push(...articlesData.articles);
        }
      } catch (e) {
        console.log('Could not parse articles.json');
      }
    }

    // If no articles.json, look for individual JSON files
    if (articles.length === 0) {
      console.log('No articles.json found, looking for individual article files...');
      const articleFiles = zipEntries.filter(entry => 
        !entry.isDirectory && 
        entry.entryName.includes('/articles/') && 
        entry.entryName.endsWith('.json')
      );
      
      console.log(`Found ${articleFiles.length} individual article files`);
      
      articleFiles.forEach(entry => {
        try {
          const data = JSON.parse(entry.getData().toString('utf8'));
          if (data.title || data.id || data.name) {
            articles.push(data);
          }
        } catch (e) {
          console.log(`Could not parse ${entry.entryName}:`, e instanceof Error ? e.message : 'Unknown error');
        }
      });
      
      console.log(`Successfully parsed ${articles.length} articles from individual files`);
    }

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

  // Base fields all content types have
  const baseContent: any = {
    userId,
    notebookId,
    name: article.title || 'Untitled',
    description: article.content || article.excerpt || '',
  };

  // Add type-specific fields
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
        if (contentType === 'character') {
          const character = await storage.createCharacter({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(character.id);
          console.log(`[Import ${jobId}] ✓ Created character: ${article.title}`);
        } else if (contentType === 'location') {
          const location = await storage.createLocation({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(location.id);
          console.log(`[Import ${jobId}] ✓ Created location: ${article.title}`);
        } else if (contentType === 'organization') {
          const org = await storage.createOrganization({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(org.id);
          console.log(`[Import ${jobId}] ✓ Created organization: ${article.title}`);
        } else if (contentType === 'species') {
          const species = await storage.createSpecies({
            ...mapped,
            userId,
            notebookId,
          });
          results.imported.push(species.id);
          console.log(`[Import ${jobId}] ✓ Created species: ${article.title}`);
        } else {
          // Skip unsupported types for now
          results.skipped.push(`${article.title} (${contentType})`);
          console.log(`[Import ${jobId}] ⊘ Skipped (unsupported type): ${article.title} (${contentType})`);
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
