import { Router } from "express";
import { storage } from "../storage";
import { insertConflictSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/generate", async (req: any, res) => {
  try {
    const generateRequestSchema = z.object({
      conflictType: z.string().optional(),
      genre: z.string().optional(),
    });
    
    const { conflictType, genre } = generateRequestSchema.parse(req.body);
    
    // TODO: Extract generator function from main routes.ts file
    const generatedConflicts = [{
      name: `Generated ${conflictType || 'conflict'}`,
      description: `A ${genre || 'general'} conflict involving ${conflictType || 'tension'}`,
      conflictType: conflictType || 'internal',
      genre,
      userId: userId || null
    }];
    const conflictsList = generatedConflicts.map((conflict: any) => ({
      ...conflict,
      userId: userId || null
    }));

    // Create individual conflicts using createConflict
    const createdConflicts = [];
    for (const conflictData of conflictsList) {
      try {
        const validatedConflict = insertConflictSchema.parse(conflictData);
        const savedConflict = await storage.createConflict(validatedConflict);
        createdConflicts.push(savedConflict);
      } catch (conflictError) {
        console.error('Error creating individual conflict:', conflictError);
        // Continue with other conflicts even if one fails
      }
    }

    res.json(createdConflicts);
  } catch (error) {
    console.error('Error generating conflicts:', error);
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
    
    const validatedConflict = insertConflictSchema.parse(req.body);
    const savedConflict = await storage.createConflict(validatedConflict);
    res.json(savedConflict);
  } catch (error) {
    console.error('Error saving conflict:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to save conflict' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const conflicts = await storage.getUserConflicts(userId, notebookId);
    res.json(conflicts);
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    res.status(500).json({ error: 'Failed to fetch conflicts' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const conflict = await storage.getConflict(req.params.id);
    if (!conflict) {
      return res.status(404).json({ error: 'Conflict not found' });
    }
    res.json(conflict);
  } catch (error) {
    console.error('Error fetching conflict:', error);
    res.status(500).json({ error: 'Failed to fetch conflict' });
  }
});

export default router;
