import { Router } from "express";
import { storage } from "../storage";
import { insertArmorSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

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
    
    const validatedArmor = insertArmorSchema.parse(req.body);
    const savedArmor = await storage.createArmor(validatedArmor);
    res.json(savedArmor);
  } catch (error) {
    console.error('Error saving armor:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save armor' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const armors = await storage.getUserArmor(userId, notebookId);
    res.json(armors);
  } catch (error) {
    console.error('Error fetching armors:', error);
    res.status(500).json({ error: 'Failed to fetch armors' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const armor = await storage.getArmor(req.params.id);
    if (!armor) {
      return res.status(404).json({ error: 'Armor not found' });
    }
    if (armor.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this armor' });
    }
    res.json(armor);
  } catch (error) {
    console.error('Error fetching armor:', error);
    res.status(500).json({ error: 'Failed to fetch armor' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const validatedUpdates = insertArmorSchema.parse(req.body);
    const updatedArmor = await storage.updateArmor(req.params.id, userId, validatedUpdates);
    res.json(updatedArmor);
  } catch (error) {
    console.error('Error updating armor:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteArmor(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting armor:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete armor' });
  }
});

export default router;
