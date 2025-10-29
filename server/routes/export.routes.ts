import { Router } from "express";
import { storage } from "../storage";
import { logger } from "../utils/logger";
import { db } from "../db";
import { 
  users, 
  userPreferences, 
  userSubscriptions,
  aiUsageLogs,
  aiUsageDailySummary,
  teamMemberships,
  feedback,
  apiKeys,
  apiKeyUsageLogs,
  billingAlerts,
  discountCodeUsage
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { exportRateLimiter } from "../security/rateLimiters";

const router = Router();

// GET /api/export/user-data - Export all user data as JSON (GDPR compliance)
router.get("/user-data", exportRateLimiter, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const userEmail = req.user.claims.email || "unknown";

    logger.info(`Starting comprehensive GDPR data export for user ${userId}`);

    // 1. Get user account information (excluding sensitive fields)
    const userInfo = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      subscriptionTier: users.subscriptionTier,
      grandfatheredTier: users.grandfatheredTier,
      onboardingCompleted: users.onboardingCompleted,
      trialUsed: users.trialUsed,
      mfaEnabled: users.mfaEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

    // 2. Get all notebooks for the user
    const notebooks = await storage.getUserNotebooks(userId);

    // 3. Get data across all notebooks
    const notebookContent: any = {};
    const allTimelines: any[] = [];
    const allFamilyTrees: any[] = [];
    
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
        timelines,
        familyTrees,
        // Additional content types
        plants,
        animals,
        buildings,
        accessories,
        clothing,
        materials,
        settlements,
        societies,
        factions,
        militaryUnits,
        myths,
        legends,
        events,
        spells,
        resources,
        transportation,
        naturalLaws,
        traditions,
        rituals,
        ceremonies,
        maps,
        music,
        dances,
        laws,
        policies,
        potions,
        professions,
        ranks,
        conditions,
        names,
        conflicts,
        themes,
        moods,
        descriptions,
        ethnicities,
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
        storage.getUserTimelines(userId, notebook.id),
        storage.getUserFamilyTrees(userId, notebook.id),
        // Additional content
        storage.getUserPlants(userId, notebook.id),
        storage.getUserAnimals(userId, notebook.id),
        storage.getUserBuildings(userId, notebook.id),
        storage.getUserAccessories(userId, notebook.id),
        storage.getUserClothing(userId, notebook.id),
        storage.getUserMaterials(userId, notebook.id),
        storage.getUserSettlements(userId, notebook.id),
        storage.getUserSocieties(userId, notebook.id),
        storage.getUserFaction(userId, notebook.id),
        storage.getUserMilitaryUnits(userId, notebook.id),
        storage.getUserMyths(userId, notebook.id),
        storage.getUserLegends(userId, notebook.id),
        storage.getUserEvents(userId, notebook.id),
        storage.getUserSpells(userId, notebook.id),
        storage.getUserResources(userId, notebook.id),
        storage.getUserTransportation(userId, notebook.id),
        storage.getUserNaturalLaws(userId, notebook.id),
        storage.getUserTraditions(userId, notebook.id),
        storage.getUserRituals(userId, notebook.id),
        storage.getUserCeremonies(userId, notebook.id),
        storage.getUserMaps(userId, notebook.id),
        storage.getUserMusic(userId, notebook.id),
        storage.getUserDances(userId, notebook.id),
        storage.getUserLaws(userId, notebook.id),
        storage.getUserPolicies(userId, notebook.id),
        storage.getUserPotions(userId, notebook.id),
        storage.getUserProfessions(userId, notebook.id),
        storage.getUserRanks(userId, notebook.id),
        storage.getUserConditions(userId, notebook.id),
        storage.getUserNames(userId, notebook.id),
        storage.getUserConflicts(userId, notebook.id),
        storage.getUserThemes(userId, notebook.id),
        storage.getUserMoods(userId, notebook.id),
        storage.getUserDescriptions(userId, notebook.id),
        storage.getUserEthnicities(userId, notebook.id),
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
        timelines,
        familyTrees,
        plants,
        animals,
        buildings,
        accessories,
        clothing,
        materials,
        settlements,
        societies,
        factions,
        militaryUnits,
        myths,
        legends,
        events,
        spells,
        resources,
        transportation,
        naturalLaws,
        traditions,
        rituals,
        ceremonies,
        maps,
        music,
        dances,
        laws,
        policies,
        potions,
        professions,
        ranks,
        conditions,
        names,
        conflicts,
        themes,
        moods,
        descriptions,
        ethnicities,
      };
      
      // Collect all timelines and family trees across notebooks
      allTimelines.push(...timelines);
      allFamilyTrees.push(...familyTrees);
    }

    // 4. Get user-level data (not scoped to notebooks)
    const [
      projects,
      allGuides,
      canvases,
      conversationThreads,
      preferences,
      savedItems,
      folders,
      notes,
      pinnedContent,
    ] = await Promise.all([
      storage.getUserProjects(userId),
      storage.getGuides(), // Get all guides, then filter by userId
      storage.getUserCanvases(userId),
      storage.getConversationThreads({ userId }),
      storage.getUserPreferences(userId),
      storage.getUserSavedItems(userId),
      storage.getUserFolders(userId),
      storage.getUserNotes(userId),
      // Get pinned content for all notebooks
      Promise.all(notebooks.map(nb => storage.getUserPinnedContent(userId, nb.id))).then(results => results.flat()),
    ]);

    // Filter guides to only include those created by the user
    const guides = allGuides.filter((guide: any) => guide.userId === userId);

    // 5. Get subscription and billing data
    const [subscription, alerts, discountUsage] = await Promise.all([
      db.select()
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1),
      db.select()
        .from(billingAlerts)
        .where(eq(billingAlerts.userId, userId)),
      db.select()
        .from(discountCodeUsage)
        .where(eq(discountCodeUsage.userId, userId)),
    ]);

    // 6. Get AI usage data
    const [usageLogs, dailySummary] = await Promise.all([
      db.select()
        .from(aiUsageLogs)
        .where(eq(aiUsageLogs.userId, userId))
        .limit(1000), // Limit to last 1000 entries
      db.select()
        .from(aiUsageDailySummary)
        .where(eq(aiUsageDailySummary.userId, userId)),
    ]);

    // 7. Get team memberships
    const teams = await db.select()
      .from(teamMemberships)
      .where(eq(teamMemberships.userId, userId));

    // 8. Get feedback submitted
    const userFeedback = await db.select()
      .from(feedback)
      .where(eq(feedback.userId, userId));

    // 9. Get API keys (without sensitive secrets)
    const userApiKeys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
      isActive: apiKeys.isActive,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));

    // 10. Get API key usage logs
    const keyUsageLogs = await db.select()
      .from(apiKeyUsageLogs)
      .where(eq(apiKeyUsageLogs.userId, userId))
      .limit(1000); // Limit to last 1000 entries

    // Build comprehensive export data object
    const exportData = {
      exportMetadata: {
        exportDate: new Date().toISOString(),
        userId,
        userEmail,
        version: "2.0",
        description: "Complete GDPR data export including all user-generated content, preferences, and usage data",
      },
      
      // Account Information
      accountInformation: userInfo[0] || null,
      
      // Content organized by notebooks
      notebookContent,
      
      // Projects and associated content
      projects: {
        projects,
        timelines: allTimelines,
        familyTrees: allFamilyTrees,
        canvases,
        notes,
        folders,
      },
      
      // Guides created by user
      guides,
      
      // AI Assistant data
      assistant: {
        conversationThreads,
      },
      
      // User preferences and settings
      preferences,
      savedItems,
      pinnedContent,
      
      // Subscription and billing
      billing: {
        subscription: subscription[0] || null,
        billingAlerts: alerts,
        discountCodeUsage: discountUsage,
      },
      
      // AI usage tracking
      aiUsage: {
        recentLogs: usageLogs,
        dailySummary: dailySummary,
      },
      
      // Team memberships
      teams,
      
      // Feedback submitted
      feedback: userFeedback,
      
      // API keys and usage (without secrets)
      apiAccess: {
        apiKeys: userApiKeys,
        usageLogs: keyUsageLogs,
      },
    };

    // Set headers for file download
    const filename = `writecraft-export-${userId}-${Date.now()}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    logger.info(`Comprehensive GDPR data export completed for user ${userId}`);
    res.json(exportData);
  } catch (error) {
    logger.error("Error exporting user data:", error);
    res.status(500).json({ error: "Failed to export user data" });
  }
});

export default router;
