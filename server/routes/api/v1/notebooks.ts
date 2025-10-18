import { Router } from 'express';
import { apiAuthMiddleware, requireScope, addRateLimitHeaders, ApiAuthRequest } from '../../../middleware/apiAuthMiddleware';
import { storage } from '../../../storage';

const router = Router();

// Apply API authentication to all routes
router.use(apiAuthMiddleware);
router.use(addRateLimitHeaders);

/**
 * List all notebooks for the authenticated user
 * GET /api/v1/notebooks
 */
router.get('/', async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;
    
    const notebooks = await storage.getUserNotebooks(userId);
    
    res.json({
      notebooks,
      count: notebooks.length,
    });
  } catch (error) {
    console.error('Error fetching notebooks:', error);
    res.status(500).json({
      error: 'Failed to fetch notebooks',
    });
  }
});

/**
 * Get a specific notebook by ID
 * GET /api/v1/notebooks/:id
 */
router.get('/:id', async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;
    const notebookId = req.params.id;
    
    const notebook = await storage.getNotebook(notebookId, userId);
    
    if (!notebook) {
      return res.status(404).json({
        error: 'Notebook not found',
      });
    }
    
    res.json(notebook);
  } catch (error) {
    console.error('Error fetching notebook:', error);
    res.status(500).json({
      error: 'Failed to fetch notebook',
    });
  }
});

/**
 * Create a new notebook
 * POST /api/v1/notebooks
 */
router.post('/', requireScope('write'), async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;
    
    const notebook = await storage.createNotebook({
      ...req.body,
      userId,
    });
    
    res.status(201).json(notebook);
  } catch (error) {
    console.error('Error creating notebook:', error);
    res.status(500).json({
      error: 'Failed to create notebook',
    });
  }
});

/**
 * Update a notebook
 * PATCH /api/v1/notebooks/:id
 */
router.patch('/:id', requireScope('write'), async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;
    const notebookId = req.params.id;
    
    const notebook = await storage.updateNotebook(notebookId, userId, req.body);
    
    if (!notebook) {
      return res.status(404).json({
        error: 'Notebook not found',
      });
    }
    
    res.json(notebook);
  } catch (error) {
    console.error('Error updating notebook:', error);
    res.status(500).json({
      error: 'Failed to update notebook',
    });
  }
});

/**
 * Delete a notebook
 * DELETE /api/v1/notebooks/:id
 */
router.delete('/:id', requireScope('write'), async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;
    const notebookId = req.params.id;
    
    await storage.deleteNotebook(notebookId, userId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting notebook:', error);
    res.status(500).json({
      error: 'Failed to delete notebook',
    });
  }
});

export default router;
