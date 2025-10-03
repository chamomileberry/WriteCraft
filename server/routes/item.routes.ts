import { Router } from "express";
import { storage } from "../storage";
import { insertItemSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/generate", async (req: any, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client payload)
    const userId = req.user.claims.sub;
    
    const generateRequestSchema = z.object({
      itemType: z.string().optional(),
      genre: z.string().optional(),
      notebookId: z.string()
    });
    
    const { itemType, genre, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate user owns the notebook before creating content
    const userNotebook = await storage.getNotebook(notebookId, userId);
    if (!userNotebook) {
      return res.status(403).json({ error: 'Notebook not found or access denied' });
    }
    
    // TODO: Extract generator function from main routes.ts file
    const item = {
      name: `Generated ${itemType || 'item'}`,
      description: `A ${genre || 'mysterious'} ${itemType || 'object'} with special properties`,
      itemType: itemType || 'artifact',
      genre,
      userId,
      notebookId
    };

    const validatedItem = insertItemSchema.parse(item);
    const savedItem = await storage.createItem(validatedItem);
    res.json(savedItem);
  } catch (error) {
    console.error('Error generating item:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.body.notebookId;
    
    // Validate notebook ownership before allowing write
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this notebook' });
      }
    }
    
    const itemData = { ...req.body, userId };
    const validatedItem = insertItemSchema.parse(itemData);
    const savedItem = await storage.createItem(validatedItem);
    res.json(savedItem);
  } catch (error) {
    console.error('Error saving item:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save item' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client-supplied userId)
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const items = await storage.getUserItems(userId, notebookId);
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const item = await storage.getItem(req.params.id, userId, notebookId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

export default router;
