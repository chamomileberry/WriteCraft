import { Router } from "express";
import { storage } from "../storage";
import { logger } from "../utils/logger";

const router = Router();

// GET /api/export/user-data - Export all user data as JSON
router.get("/user-data", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userEmail = req.user.claims.email || "unknown";

    logger.info(`Starting data export for user ${userId}`);

    // First, get all notebooks for the user
    const notebooks = await storage.getUserNotebooks(userId);

    // Get data across all notebooks
    const notebookContent: any = {};
    for (const notebook of notebooks) {
      const [
        characters,
        plots,
        prompts,
        settings,
        creatures,
        locations,
        items,
        organizations,
        species,
        cultures,
        documents,
        foods,
        drinks,
        weapons,
        armor,
        religions,
        languages,
        technologies,
      ] = await Promise.all([
        storage.getUserCharacters(userId, notebook.id),
        storage.getUserPlots(userId, notebook.id),
        storage.getUserPrompts(userId, notebook.id),
        storage.getUserSettings(userId, notebook.id),
        storage.getUserCreatures(userId, notebook.id),
        storage.getUserLocations(userId, notebook.id),
        storage.getUserItems(userId, notebook.id),
        storage.getUserOrganizations(userId, notebook.id),
        storage.getUserSpecies(userId, notebook.id),
        storage.getUserCultures(userId, notebook.id),
        storage.getUserDocuments(userId, notebook.id),
        storage.getUserFoods(userId, notebook.id),
        storage.getUserDrinks(userId, notebook.id),
        storage.getUserWeapons(userId, notebook.id),
        storage.getUserArmor(userId, notebook.id),
        storage.getUserReligions(userId, notebook.id),
        storage.getUserLanguages(userId, notebook.id),
        storage.getUserTechnologies(userId, notebook.id),
      ]);

      notebookContent[notebook.id] = {
        notebook,
        characters,
        plots,
        prompts,
        settings,
        creatures,
        locations,
        items,
        organizations,
        species,
        cultures,
        documents,
        foods,
        drinks,
        weapons,
        armor,
        religions,
        languages,
        technologies,
      };
    }

    // Get user-level data (not scoped to notebooks)
    const [
      projects,
      guides,
      timelines,
      familyTrees,
      canvases,
      conversationThreads,
      userPreferences,
    ] = await Promise.all([
      storage.getUserProjects(userId),
      storage.getGuides(userId, { includeShared: true }),
      storage.getUserTimelines(userId),
      storage.getUserFamilyTrees(userId),
      storage.getUserCanvases(userId),
      storage.getConversationThreads({ userId }),
      storage.getUserPreferences(userId),
    ]);

    // Build export data object
    const exportData = {
      exportMetadata: {
        exportDate: new Date().toISOString(),
        userId,
        userEmail,
        version: "1.0",
      },
      notebookContent,
      projects: {
        projects,
        timelines,
        familyTrees,
        canvases,
      },
      guides,
      assistant: {
        conversationThreads,
      },
      preferences: userPreferences,
    };

    // Set headers for file download
    const filename = `writecraft-export-${userId}-${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    logger.info(`Data export completed for user ${userId}`);
    res.json(exportData);
  } catch (error) {
    logger.error("Error exporting user data:", error);
    res.status(500).json({ error: "Failed to export user data" });
  }
});

export default router;
