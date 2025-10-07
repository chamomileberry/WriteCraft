import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// GET /api/admin/characters/issues - Get characters with incomplete data
router.get("/characters/issues", async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const notebookId = req.query.notebookId as string;
    if (!notebookId) {
      return res.status(400).json({ error: "notebookId is required" });
    }

    // Validate notebook ownership
    const hasAccess = await storage.validateNotebookOwnership(notebookId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: "You do not have access to this notebook" });
    }

    const issues = await storage.getCharactersWithIssues(userId, notebookId);
    
    res.json({
      missingFamilyName: issues.missingFamilyName,
      missingDescription: issues.missingDescription,
      missingImage: issues.missingImage,
      stats: {
        missingFamilyNameCount: issues.missingFamilyName.length,
        missingDescriptionCount: issues.missingDescription.length,
        missingImageCount: issues.missingImage.length,
        totalIssues: issues.missingFamilyName.length + issues.missingDescription.length + issues.missingImage.length
      }
    });
  } catch (error) {
    console.error("Error fetching character issues:", error);
    res.status(500).json({ error: "Failed to fetch character issues" });
  }
});

// GET /api/admin/characters/duplicates - Get potential duplicate characters
router.get("/characters/duplicates", async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const notebookId = req.query.notebookId as string;
    if (!notebookId) {
      return res.status(400).json({ error: "notebookId is required" });
    }

    // Validate notebook ownership
    const hasAccess = await storage.validateNotebookOwnership(notebookId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: "You do not have access to this notebook" });
    }

    const duplicateGroups = await storage.getPotentialDuplicates(userId, notebookId);
    
    res.json({
      duplicateGroups,
      stats: {
        totalGroups: duplicateGroups.length,
        totalCharacters: duplicateGroups.reduce((sum, group) => sum + group.length, 0)
      }
    });
  } catch (error) {
    console.error("Error fetching potential duplicates:", error);
    res.status(500).json({ error: "Failed to fetch potential duplicates" });
  }
});

export default router;
