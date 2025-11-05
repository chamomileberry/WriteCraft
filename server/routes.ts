import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerDomainRoutes } from "./routes/index";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { logger } from "./utils/logger";
import aiRoutes from "./routes/ai.routes";
import importRoutes from "./routes/import.routes";
import pexelsRoutes from "./routes/pexels.routes";
import ideogramRoutes from "./routes/ideogram.routes";
import stockImagesRoutes from "./routes/stock-images.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import stripeRoutes from "./routes/stripe.routes";
import billingAlertsRoutes from "./routes/billingAlerts.routes";
import { discountCodeRouter } from "./routes/discountCode.routes";
import mfaRoutes from "./routes/mfa.routes";
import securityRoutes from "./routes/security.routes";
import cspReportRoutes from "./routes/csp-report.routes";
import migrationRoutes from "./routes/migration.routes";
import teamAnalyticsRoutes from "./routes/team-analytics.routes";
import feedbackRoutes from "./routes/feedback.routes";
import adminFeedbackRoutes from "./routes/admin-feedback.routes";
import exportRoutes from "./routes/export.routes";
import healthRoutes from "./routes/health.routes";
import sentryTestRoutes from "./routes/sentry-test.routes";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { createRateLimiter } from "./security";
import {
  insertCharacterSchema,
  updateCharacterSchema,
  insertPlotSchema,
  insertPromptSchema,
  insertGuideSchema,
  insertSavedItemSchema,
  insertSettingSchema,
  insertNameSchema,
  insertConflictSchema,
  insertThemeSchema,
  insertMoodSchema,
  insertCreatureSchema,
  insertLocationSchema,
  insertItemSchema,
  insertOrganizationSchema,
  insertSpeciesSchema,
  insertCultureSchema,
  insertDocumentSchema,
  insertFoodSchema,
  insertWeaponSchema,
  insertReligionSchema,
  insertLanguageSchema,
  insertTechnologySchema,
  insertProfessionSchema,
  insertProjectSchema,
  insertProjectLinkSchema,
  insertFolderSchema,
  insertNoteSchema,
} from "@shared/schema";
import { z } from "zod";
import {
  generateCharacterWithAI,
  generateSettingWithAI,
  generateCreatureWithAI,
  generatePromptWithAI,
  generateCharacterFieldWithAI,
  analyzeText,
  rephraseText,
  proofreadText,
  generateSynonyms,
  getWordDefinition,
  generateQuestions,
  improveText,
  conversationalChat,
} from "./ai-generation";
import {
  trackAIUsage,
  attachUsageMetadata,
} from "./middleware/aiUsageMiddleware";

// Search endpoint rate limiting: 150 requests per 15 minutes
// Prevents search abuse while allowing reasonable usage
const searchRateLimiter = createRateLimiter({
  maxRequests: 150,
  windowMs: 15 * 60 * 1000,
});

// Upload rate limiting: 50 requests per 15 minutes
// Prevents upload spam and DoS attacks
const uploadRateLimiter = createRateLimiter({
  maxRequests: 50,
  windowMs: 15 * 60 * 1000,
});

// Notes/Chat rate limiting: 200 requests per 15 minutes
// Prevents abuse while allowing normal usage
const contentRateLimiter = createRateLimiter({
  maxRequests: 200,
  windowMs: 15 * 60 * 1000,
});

// Timeline rate limiting: 100 requests per 15 minutes
// Prevents DoS attacks on timeline operations
const timelineRateLimiter = createRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register Sentry test endpoints FIRST - must be before any auth or middleware
  // These endpoints need to be completely public to test error tracking
  app.use("/api/sentry", sentryTestRoutes);

  // Setup Replit Auth (must be before other routes)
  await setupAuth(app);

  // Health check endpoints (no authentication required - for uptime monitoring)
  app.use("/api/health", healthRoutes);

  // CSP violation reporting endpoint (no authentication required - browser sends these automatically)
  app.use("/api/csp-report", cspReportRoutes);

  // Versioned API routes (uses API key authentication instead of session)
  const { default: v1ApiRoutes } = await import("./routes/api/v1/index");
  app.use("/api/v1", v1ApiRoutes);

  // Use secure user routes with enhanced security features
  // These routes include:
  // - Rate limiting protection
  // - CSRF token validation
  // - Input sanitization
  // - Admin field protection
  // - Security audit logging
  const { default: securityTestRoutes } = await import(
    "./security/test-endpoints"
  );
  app.use("/api", securityTestRoutes);

  // Register MFA (Multi-Factor Authentication) routes
  app.use("/api/auth/mfa", mfaRoutes);

  // Register security management routes (admin only)
  app.use("/api/security", securityRoutes);

  // Register security test endpoints (development only)
  if (process.env.NODE_ENV !== "production") {
    const { default: securityTestRoutes } = await import(
      "./security/test-endpoints"
    );
    app.use("/api", securityTestRoutes);
  }

  // Register modular domain-specific routes
  registerDomainRoutes(app);

  // Register AI routes
  app.use("/api/ai", aiRoutes);

  // Register import routes
  app.use("/api/import", isAuthenticated, importRoutes);

  // Register Pexels stock image routes
  app.use("/api/pexels", isAuthenticated, pexelsRoutes);

  // Register stock images routes
  app.use("/api/stock-images", isAuthenticated, stockImagesRoutes);

  // Register Ideogram V3 AI image generation routes
  app.use("/api/ideogram", isAuthenticated, ideogramRoutes);

  // Register subscription routes
  app.use("/api/subscription", isAuthenticated, subscriptionRoutes);

  // Register Stripe payment routes
  app.use("/api/stripe", stripeRoutes);

  // Register billing alerts routes
  app.use("/api/billing-alerts", billingAlertsRoutes);

  // Register discount code routes
  app.use("/api/discount-codes", discountCodeRouter);

  // Migration routes (admin endpoints for tier assignment)
  app.use("/api/migration", migrationRoutes);

  // Team analytics and audit log routes (Team tier exclusive)
  app.use("/api/team", teamAnalyticsRoutes);

  // Register feedback routes
  app.use("/api/feedback", isAuthenticated, feedbackRoutes);
  app.use("/api/admin/feedback", isAuthenticated, adminFeedbackRoutes);

  // Register data export routes
  app.use("/api/export", isAuthenticated, exportRoutes);

  // Serve uploaded objects with optional access control
  // NOTE: World-building content and avatars are publicly accessible via UUID protection.
  // Private uploads in .private/ directory would require authentication and ownership validation.
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      // Check if this is a private object (in .private/ directory)
      const isPrivate = req.path.includes("/.private/");

      if (isPrivate) {
        // Private objects require authentication and ownership check
        // For production use, implement ownership validation here
        return res.status(403).json({
          error:
            "Private objects require authentication and ownership validation",
        });
      }

      // Extract the file path after /objects/
      const filePath = req.path.replace("/objects/", "");

      // Try to find in public search paths (for avatars and other public content)
      let objectFile = await objectStorageService.searchPublicObject(filePath);

      // If not found in public paths, try private entity storage for backward compatibility
      if (!objectFile) {
        try {
          objectFile = await objectStorageService.getObjectEntityFile(req.path);
        } catch (err) {
          if (err instanceof ObjectNotFoundError) {
            return res.sendStatus(404);
          }
          throw err;
        }
      }

      if (!objectFile) {
        return res.sendStatus(404);
      }

      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error retrieving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post(
    "/api/upload/image",
    isAuthenticated,
    uploadRateLimiter,
    async (req, res) => {
      try {
        const objectStorageService = new ObjectStorageService();
        const { visibility } = req.body;
        const isPublic = visibility === "public";

        let uploadURL: string;
        let objectId: string;
        let objectPath: string;

        if (isPublic) {
          // Public uploads (avatars) go to public directory
          const result = await objectStorageService.getPublicObjectUploadURL();
          uploadURL = result.uploadURL;
          objectId = result.objectId;
          objectPath = `/objects/avatars/${objectId}`;
        } else {
          // Private uploads (content images) go to private directory
          const result = await objectStorageService.getObjectEntityUploadURL();
          uploadURL = result.uploadURL;
          objectId = result.objectId;
          objectPath = `/objects/uploads/${objectId}`;
        }

        res.json({
          uploadURL,
          objectPath,
          objectId,
        });
      } catch (error) {
        console.error("Error generating upload URL:", error);
        res.status(500).json({ error: "Failed to generate upload URL" });
      }
    },
  );

  // Finalize upload - requires authentication for security
  app.post(
    "/api/upload/finalize",
    isAuthenticated,
    uploadRateLimiter,
    async (req: any, res) => {
      try {
        const { objectPath } = req.body;

        if (!objectPath) {
          return res.status(400).json({ error: "objectPath is required" });
        }

        // Get authenticated user ID from session (never trust client headers)
        const userId = req.user.claims.sub;

        const objectStorageService = new ObjectStorageService();

        // Check if this is a public avatar (no ACL needed for public storage)
        if (objectPath.startsWith("/objects/avatars/")) {
          // Public avatars are already in public storage, just return the path
          res.json({ objectPath });
          return;
        }

        // For private uploads, set ACL policy
        const finalPath =
          await objectStorageService.trySetObjectEntityAclPolicy(objectPath, {
            owner: userId,
            visibility: "public", // Public for world-building content
          });

        res.json({ objectPath: finalPath });
      } catch (error) {
        console.error("Error finalizing upload:", error);
        res.status(500).json({ error: "Failed to finalize upload" });
      }
    },
  );

  // Universal search endpoint
  app.get(
    "/api/search",
    isAuthenticated,
    searchRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const query = (req.query.q as string) || "";
        const typeFilter = (req.query.type as string) || ""; // Optional type filter

        const searchResults = await storage.searchAllContent(userId, query);

        // Filter by type if specified
        const filteredResults = typeFilter
          ? searchResults.filter((result) => result.type === typeFilter)
          : searchResults;

        res.json(filteredResults);
      } catch (error) {
        console.error("Error searching content:", error);
        res.status(500).json({ error: "Failed to search content" });
      }
    },
  );

  // Pinned content endpoints
  // Uses contentRateLimiter to prevent abuse of expensive enhanced data fetching
  app.get(
    "/api/pinned-content",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const notebookId = req.query.notebookId as string;
        const category = req.query.category as string;

        if (!notebookId) {
          return res.status(400).json({ error: "Notebook ID is required" });
        }

        const pinnedItems = await storage.getUserPinnedContent(
          userId,
          notebookId,
          category,
        );

        // Enhance pinned items with actual content data
        const enhancedItems = await Promise.all(
          pinnedItems.map(async (pin) => {
            let title = "Unknown";
            let subtitle = "";

            try {
              // Fetch the actual content based on type
              // Note: If pin.notebookId is not available, skip enhanced data
              if (pin.notebookId) {
                switch (pin.targetType) {
                  case "character":
                    const character = await storage.getCharacter(
                      pin.targetId,
                      pin.userId,
                      pin.notebookId,
                    );
                    if (character) {
                      // Try multiple name fields before defaulting to "Untitled Character"
                      title =
                        [character.givenName, character.familyName]
                          .filter(Boolean)
                          .join(" ")
                          .trim() ||
                        character.nickname ||
                        character.honorificTitle ||
                        "Untitled Character";
                      subtitle = character.occupation || "";
                    }
                    break;
                  case "location":
                    const location = await storage.getLocation(
                      pin.targetId,
                      pin.userId,
                      pin.notebookId,
                    );
                    if (location) {
                      title = location.name;
                      subtitle = location.locationType || "";
                    }
                    break;
                  case "organization":
                    const organization = await storage.getOrganization(
                      pin.targetId,
                      pin.userId,
                      pin.notebookId,
                    );
                    if (organization) {
                      title = organization.name;
                      subtitle = organization.organizationType || "";
                    }
                    break;
                }
              }
            } catch (error) {
              console.error(`Error fetching ${pin.targetType} data:`, error);
            }

            return {
              ...pin,
              title,
              subtitle,
            };
          }),
        );

        res.json(enhancedItems);
      } catch (error) {
        console.error("Error fetching pinned content:", error);
        res.status(500).json({ error: "Failed to fetch pinned content" });
      }
    },
  );

  app.post(
    "/api/pinned-content",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { notebookId, targetType, targetId, category, notes } = req.body;

        if (!notebookId) {
          return res.status(400).json({ error: "Notebook ID is required" });
        }

        const pinData = {
          userId,
          notebookId,
          targetType,
          targetId,
          category,
          notes,
        };

        const pinnedItem = await storage.pinContent(pinData);
        res.json(pinnedItem);
      } catch (error) {
        console.error("Error pinning content:", error);
        res.status(500).json({ error: "Failed to pin content" });
      }
    },
  );

  app.delete(
    "/api/pinned-content/:id",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const pinnedId = req.params.id;
        const notebookId = req.query.notebookId as string;

        if (!notebookId) {
          return res.status(400).json({ error: "Notebook ID is required" });
        }

        // Find the pinned item first to get its details
        const pinnedItems = await storage.getUserPinnedContent(
          userId,
          notebookId,
        );
        const pinnedItem = pinnedItems.find((item) => item.id === pinnedId);

        if (!pinnedItem) {
          return res.status(404).json({ error: "Pinned item not found" });
        }

        await storage.unpinContent(
          userId,
          pinnedItem.targetType,
          pinnedItem.targetId,
          notebookId,
        );
        res.json({ success: true });
      } catch (error) {
        console.error("Error unpinning content:", error);
        res.status(500).json({ error: "Failed to unpin content" });
      }
    },
  );

  // Note routes
  app.post(
    "/api/notes",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        // Override any client-provided userId with authenticated session
        const noteData = { ...req.body, userId };
        const note = insertNoteSchema.parse(noteData);
        const newNote = await storage.createNote(note);
        res.status(201).json(newNote);
      } catch (error) {
        console.error("Error creating note:", error);
        res.status(400).json({ error: "Failed to create note" });
      }
    },
  );

  app.get("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const note = await storage.getNote(id, userId);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });

  app.get("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, folderId, documentId } = req.query;

      let notes;
      if (folderId) {
        notes = await storage.getFolderNotes(folderId as string, userId);
      } else if (documentId) {
        // Get notes for specific document (manuscript or guide)
        notes = await storage.getDocumentNotes(documentId as string, userId);
      } else {
        // Get all notes for user and type (backward compatibility)
        notes = await storage.getUserNotes(userId, type as string);
      }
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.put(
    "/api/notes/:id",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const { userId: _ignored, ...updates } = req.body;
        const note = await storage.updateNote(id, userId, updates);
        res.json(note);
      } catch (error: any) {
        console.error("Error updating note:", error);
        if (error.message === "Note not found or unauthorized") {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Failed to update note" });
        }
      }
    },
  );

  app.delete(
    "/api/notes/:id",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        await storage.deleteNote(id, userId);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ error: "Failed to delete note" });
      }
    },
  );

  // Quick note routes
  app.post(
    "/api/quick-note",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { title, content } = req.body;

        // Check if user already has a quick note
        const existingNote = await storage.getUserQuickNote(userId);
        if (existingNote) {
          // Update existing quick note
          const updatedNote = await storage.updateQuickNote(
            existingNote.id,
            userId,
            { title, content },
          );
          res.json(updatedNote);
        } else {
          // Create new quick note
          const newNote = await storage.createQuickNote(
            userId,
            title || "Quick Note",
            content || "",
          );
          res.status(201).json(newNote);
        }
      } catch (error) {
        console.error("Error saving quick note:", error);
        res.status(500).json({ error: "Failed to save quick note" });
      }
    },
  );

  app.get(
    "/api/quick-note",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;

        const quickNote = await storage.getUserQuickNote(userId);
        if (!quickNote) {
          return res.status(404).json({ error: "Quick note not found" });
        }

        res.json(quickNote);
      } catch (error) {
        console.error("Error fetching quick note:", error);
        res.status(500).json({ error: "Failed to fetch quick note" });
      }
    },
  );

  // Fetch a specific quick note by ID
  app.get(
    "/api/quick-note/:id",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;

        const quickNote = await storage.getQuickNoteById(id, userId);
        if (!quickNote) {
          return res.status(404).json({ error: "Quick note not found" });
        }

        res.json(quickNote);
      } catch (error) {
        console.error("Error fetching quick note:", error);
        res.status(500).json({ error: "Failed to fetch quick note" });
      }
    },
  );

  // Update a specific quick note by ID
  app.put(
    "/api/quick-note/:id",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const { title, content } = req.body;

        const updatedNote = await storage.updateQuickNote(id, userId, {
          title,
          content,
        });
        res.json(updatedNote);
      } catch (error) {
        console.error("Error updating quick note:", error);
        if (
          error instanceof Error &&
          error.message === "Quick note not found or unauthorized"
        ) {
          return res.status(404).json({ error: "Quick note not found" });
        }
        res.status(500).json({ error: "Failed to update quick note" });
      }
    },
  );

  app.delete(
    "/api/quick-note",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;

        const quickNote = await storage.getUserQuickNote(userId);
        if (!quickNote) {
          return res.status(404).json({ error: "Quick note not found" });
        }

        await storage.deleteQuickNote(quickNote.id, userId);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting quick note:", error);
        res.status(500).json({ error: "Failed to delete quick note" });
      }
    },
  );

  // Writing Assistant API routes
  app.post(
    "/api/writing-assistant/analyze",
    isAuthenticated,
    contentRateLimiter,
    async (req, res) => {
      try {
        const { text, editorContent, documentTitle, documentType } = z
          .object({
            text: z.string(),
            editorContent: z.string().optional(),
            documentTitle: z.string().optional(),
            documentType: z
              .enum(["manuscript", "guide", "project", "section"])
              .optional(),
          })
          .parse(req.body);
        const analysis = await analyzeText(
          text,
          editorContent,
          documentTitle,
          documentType,
        );
        res.json(analysis);
      } catch (error) {
        console.error("Error analyzing text:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  app.post(
    "/api/writing-assistant/rephrase",
    isAuthenticated,
    contentRateLimiter,
    async (req, res) => {
      try {
        const { text, style, editorContent, documentTitle, documentType } = z
          .object({
            text: z.string(),
            style: z.string(),
            editorContent: z.string().optional(),
            documentTitle: z.string().optional(),
            documentType: z
              .enum(["manuscript", "guide", "project", "section"])
              .optional(),
          })
          .parse(req.body);
        const rephrased = await rephraseText(
          text,
          style,
          editorContent,
          documentTitle,
          documentType,
        );
        res.json({ text: rephrased });
      } catch (error) {
        console.error("Error rephrasing text:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  app.post(
    "/api/writing-assistant/proofread",
    isAuthenticated,
    contentRateLimiter,
    async (req, res) => {
      try {
        const { text, editorContent, documentTitle, documentType } = z
          .object({
            text: z.string(),
            editorContent: z.string().optional(),
            documentTitle: z.string().optional(),
            documentType: z
              .enum(["manuscript", "guide", "project", "section"])
              .optional(),
          })
          .parse(req.body);
        const result = await proofreadText(
          text,
          editorContent,
          documentTitle,
          documentType,
        );
        res.json(result);
      } catch (error) {
        console.error("Error proofreading text:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  app.post(
    "/api/writing-assistant/synonyms",
    isAuthenticated,
    trackAIUsage("synonyms_generation"),
    async (req, res) => {
      try {
        const { word } = z.object({ word: z.string() }).parse(req.body);
        const aiResult = await generateSynonyms(word);

        // Attach usage metadata for tracking
        attachUsageMetadata(res, aiResult.usage, aiResult.model);

        res.json({ synonyms: aiResult.result });
      } catch (error) {
        console.error("Error generating synonyms:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  app.post(
    "/api/writing-assistant/definition",
    isAuthenticated,
    trackAIUsage("word_definition"),
    async (req, res) => {
      try {
        const { word } = z.object({ word: z.string() }).parse(req.body);
        const aiResult = await getWordDefinition(word);

        // Attach usage metadata for tracking
        attachUsageMetadata(res, aiResult.usage, aiResult.model);

        res.json({ definition: aiResult.result });
      } catch (error) {
        console.error("Error getting word definition:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  app.post(
    "/api/writing-assistant/questions",
    isAuthenticated,
    trackAIUsage("questions_generation"),
    async (req, res) => {
      try {
        const { text, editorContent, documentTitle, documentType } = z
          .object({
            text: z.string(),
            editorContent: z.string().optional(),
            documentTitle: z.string().optional(),
            documentType: z
              .enum(["manuscript", "guide", "project", "section"])
              .optional(),
          })
          .parse(req.body);
        const aiResult = await generateQuestions(
          text,
          editorContent,
          documentTitle,
          documentType,
        );

        // Attach usage metadata for tracking
        attachUsageMetadata(res, aiResult.usage, aiResult.model);

        res.json({ questions: aiResult.result });
      } catch (error) {
        console.error("Error generating questions:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  app.post(
    "/api/writing-assistant/improve",
    isAuthenticated,
    contentRateLimiter,
    async (req, res) => {
      try {
        const { text, instruction } = z
          .object({
            text: z.string(),
            instruction: z.string(),
          })
          .parse(req.body);
        const improved = await improveText(text, instruction);
        res.json({ text: improved });
      } catch (error) {
        console.error("Error improving text:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  app.post(
    "/api/writing-assistant/chat",
    isAuthenticated,
    contentRateLimiter,
    trackAIUsage("conversational_chat"),
    async (req: any, res) => {
      try {
        // Get authenticated userId from session (never trust client input)
        const userId = req.user.claims.sub;

        const {
          message,
          conversationHistory,
          editorContent,
          documentTitle,
          documentType,
          notebookId,
          projectId,
          guideId,
        } = z
          .object({
            message: z.string(),
            conversationHistory: z
              .array(
                z.object({
                  role: z.enum(["user", "assistant"]),
                  content: z.string(),
                  timestamp: z.string().optional(), // ISO timestamp for session gap detection
                }),
              )
              .optional(),
            editorContent: z.string().optional(),
            documentTitle: z.string().optional(),
            documentType: z
              .enum(["manuscript", "guide", "project", "section", "character"])
              .optional(),
            notebookId: z.string().optional(),
            projectId: z.string().optional(),
            guideId: z.string().optional(),
          })
          .parse(req.body);

        const aiResult = await conversationalChat(
          message,
          conversationHistory,
          editorContent,
          documentTitle,
          documentType,
          notebookId,
          userId,
          projectId,
          guideId,
        );

        // Attach usage metadata for tracking
        attachUsageMetadata(res, aiResult.usage, aiResult.model);

        res.json({ message: aiResult.result });
      } catch (error) {
        console.error("Error in conversational chat:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  // Chat Messages API routes
  app.post(
    "/api/chat-messages",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        // Get authenticated userId from session (never trust client headers)
        const userId = req.user.claims.sub;

        const { projectId, guideId, type, content, metadata } = z
          .object({
            projectId: z.string().optional(),
            guideId: z.string().optional(),
            type: z.enum(["user", "assistant"]),
            content: z.string(),
            metadata: z.any().optional(),
          })
          .parse(req.body);

        const chatMessage = await storage.createChatMessage({
          userId,
          projectId: projectId || null,
          guideId: guideId || null,
          type,
          content,
          metadata: metadata || null,
        });

        res.json(chatMessage);
      } catch (error) {
        console.error("Error creating chat message:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  app.get(
    "/api/chat-messages",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        // Get authenticated userId from session (never trust client headers)
        const userId = req.user.claims.sub;

        const { projectId, guideId, limit } = z
          .object({
            projectId: z.string().optional(),
            guideId: z.string().optional(),
            limit: z.coerce.number().optional().default(50),
          })
          .parse(req.query);

        const messages = await storage.getChatMessages(
          userId,
          projectId,
          guideId,
          limit,
        );
        res.json(messages);
      } catch (error) {
        console.error("Error fetching chat messages:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  app.delete(
    "/api/chat-messages",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        // Get authenticated userId from session (never trust client headers)
        const userId = req.user.claims.sub;

        const { projectId, guideId } = z
          .object({
            projectId: z.string().optional(),
            guideId: z.string().optional(),
          })
          .parse(req.query);

        await storage.deleteChatHistory(userId, projectId, guideId);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting chat history:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ error: errorMessage });
      }
    },
  );

  // User Preferences API routes
  app.get(
    "/api/user-preferences",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const preferences = await storage.getUserPreferences(userId);

        if (!preferences) {
          return res.status(404).json({ error: "User preferences not found" });
        }

        res.json(preferences);
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        res.status(500).json({ error: "Failed to fetch user preferences" });
      }
    },
  );

  app.put(
    "/api/user-preferences",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;

        const preferences = z
          .object({
            experienceLevel: z
              .enum(["beginner", "intermediate", "advanced"])
              .optional(),
            preferredGenres: z.array(z.string()).optional(),
            writingGoals: z.array(z.string()).optional(),
            feedbackStyle: z
              .enum(["direct", "gentle", "technical", "conceptual"])
              .optional(),
            targetWordCount: z.number().optional(),
            writingSchedule: z.string().optional(),
            preferredTone: z.string().optional(),
            theme: z.enum(["light", "dark"]).optional(),
          })
          .parse(req.body);

        const updated = await storage.upsertUserPreferences(
          userId,
          preferences,
        );
        res.json(updated);
      } catch (error) {
        console.error("Error updating user preferences:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        res.status(500).json({ error: "Failed to update user preferences" });
      }
    },
  );

  // Conversation Summaries API routes
  app.get(
    "/api/conversation-summary",
    isAuthenticated,
    contentRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;

        const { projectId, guideId } = z
          .object({
            projectId: z.string().optional(),
            guideId: z.string().optional(),
          })
          .parse(req.query);

        const summary = await storage.getConversationSummary(
          userId,
          projectId,
          guideId,
        );

        if (!summary) {
          return res.status(204).send(); // No content instead of 404
        }

        res.json(summary);
      } catch (error) {
        console.error("Error fetching conversation summary:", error);
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Invalid request data", details: error.errors });
        }
        res.status(500).json({ error: "Failed to fetch conversation summary" });
      }
    },
  );

  // Timeline routes
  app.post(
    "/api/timelines",
    isAuthenticated,
    timelineRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { notebookId, ...timelineData } = req.body;

        logger.debug("[POST /api/timelines] Raw request body:", req.body);
        logger.debug("[POST /api/timelines] Extracted:", {
          userId,
          notebookId,
          timelineData,
        });

        if (!notebookId) {
          return res.status(400).json({ error: "Notebook ID is required" });
        }

        const dataToInsert = {
          ...timelineData,
          userId,
          notebookId,
        };

        logger.debug("[POST /api/timelines] Data to insert:", dataToInsert);

        const timeline = await storage.createTimeline(dataToInsert);

        logger.debug("[POST /api/timelines] Created timeline:", {
          id: timeline.id,
          userId: timeline.userId,
          notebookId: timeline.notebookId,
        });
        res.json(timeline);
      } catch (error) {
        logger.error("[POST /api/timelines] Error:", error);
        res.status(500).json({ error: "Failed to create timeline" });
      }
    },
  );

  app.get(
    "/api/timelines/:id",
    isAuthenticated,
    timelineRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const { notebookId } = req.query;

        logger.debug("[GET /api/timelines/:id] Fetching timeline:", {
          id,
          userId,
          notebookId,
        });

        if (!notebookId) {
          return res.status(400).json({ error: "Notebook ID is required" });
        }

        const timeline = await storage.getTimeline(
          id,
          userId,
          notebookId as string,
        );

        logger.debug(
          "[GET /api/timelines/:id] Query result:",
          timeline ? `Found timeline ${timeline.id}` : "Timeline not found",
        );

        if (!timeline) {
          return res.status(404).json({ error: "Timeline not found" });
        }

        res.json(timeline);
      } catch (error) {
        logger.error("Error fetching timeline:", error);
        res.status(500).json({ error: "Failed to fetch timeline" });
      }
    },
  );

  // Timeline Event routes
  app.get(
    "/api/timeline-events",
    isAuthenticated,
    timelineRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { timelineId, notebookId } = req.query;

        if (!timelineId || !notebookId) {
          return res
            .status(400)
            .json({ error: "Timeline ID and Notebook ID are required" });
        }

        const events = await storage.getTimelineEvents(
          timelineId as string,
          userId,
        );
        res.json(events);
      } catch (error) {
        console.error("Error fetching timeline events:", error);
        res.status(500).json({ error: "Failed to fetch timeline events" });
      }
    },
  );

  app.post(
    "/api/timeline-events",
    isAuthenticated,
    timelineRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const {
          timelineId,
          notebookId,
          userId: _ignored,
          createdAt: _ignored2,
          updatedAt: _ignored3,
          id: _ignored4,
          ...eventData
        } = req.body;

        if (!timelineId || !notebookId) {
          return res
            .status(400)
            .json({ error: "Timeline ID and Notebook ID are required" });
        }

        // Verify timeline ownership before creating event
        const timeline = await storage.getTimeline(
          timelineId,
          userId,
          notebookId,
        );
        if (!timeline) {
          return res
            .status(404)
            .json({ error: "Timeline not found or access denied" });
        }

        // Server-side assignment of immutable fields
        const event = await storage.createTimelineEvent({
          ...eventData,
          timelineId,
          // Server assigns createdAt/updatedAt automatically via DB defaults
        });
        res.status(201).json(event);
      } catch (error) {
        console.error("Error creating timeline event:", error);
        res.status(400).json({ error: "Failed to create timeline event" });
      }
    },
  );

  app.patch(
    "/api/timeline-events/:id",
    isAuthenticated,
    timelineRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const updates = req.body;

        const event = await storage.updateTimelineEvent(id, userId, updates);
        res.json(event);
      } catch (error) {
        console.error("Error updating timeline event:", error);
        res.status(500).json({ error: "Failed to update timeline event" });
      }
    },
  );

  app.delete(
    "/api/timeline-events/:id",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const { timelineId } = req.query;

        if (!timelineId) {
          return res.status(400).json({ error: "Timeline ID is required" });
        }

        await storage.deleteTimelineEvent(id, userId, timelineId as string);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting timeline event:", error);
        res.status(500).json({ error: "Failed to delete timeline event" });
      }
    },
  );

  // Timeline Relationship routes
  app.get(
    "/api/timeline-relationships",
    isAuthenticated,
    timelineRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { timelineId, notebookId } = req.query;

        if (!timelineId || !notebookId) {
          return res
            .status(400)
            .json({ error: "Timeline ID and Notebook ID are required" });
        }

        const relationships = await storage.getTimelineRelationships(
          timelineId as string,
          userId,
        );
        res.json(relationships);
      } catch (error) {
        console.error("Error fetching timeline relationships:", error);
        res
          .status(500)
          .json({ error: "Failed to fetch timeline relationships" });
      }
    },
  );

  app.post(
    "/api/timeline-relationships",
    isAuthenticated,
    timelineRateLimiter,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const {
          timelineId,
          notebookId,
          createdAt: _ignored,
          id: _ignored2,
          ...relationshipData
        } = req.body;

        if (!timelineId || !notebookId) {
          return res
            .status(400)
            .json({ error: "Timeline ID and Notebook ID are required" });
        }

        // Verify timeline ownership before creating relationship
        const timeline = await storage.getTimeline(
          timelineId,
          userId,
          notebookId,
        );
        if (!timeline) {
          return res
            .status(404)
            .json({ error: "Timeline not found or access denied" });
        }

        // Server-side assignment of immutable fields
        const relationship = await storage.createTimelineRelationship({
          ...relationshipData,
          timelineId,
          // Server assigns createdAt automatically via DB defaults
        });
        res.status(201).json(relationship);
      } catch (error) {
        console.error("Error creating timeline relationship:", error);
        res
          .status(400)
          .json({ error: "Failed to create timeline relationship" });
      }
    },
  );

  app.delete(
    "/api/timeline-relationships/:id",
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const { id } = req.params;
        const { timelineId } = req.query;

        if (!timelineId) {
          return res.status(400).json({ error: "Timeline ID is required" });
        }

        await storage.deleteTimelineRelationship(
          id,
          userId,
          timelineId as string,
        );
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting timeline relationship:", error);
        res
          .status(500)
          .json({ error: "Failed to delete timeline relationship" });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for generating random content
function generateRandomName(): string {
  const names = [
    "Elena",
    "Marcus",
    "Zara",
    "Kai",
    "Luna",
    "Dex",
    "Nova",
    "Orion",
    "Maya",
    "Finn",
    "Aria",
    "Phoenix",
    "Sage",
    "River",
    "Storm",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function generateRandomSetup(): string {
  const setups = [
    "In a world where magic is forbidden, a young apprentice discovers they possess incredible powers",
    "A detective investigating a series of mysterious disappearances uncovers a conspiracy that goes to the highest levels of government",
    "After a global catastrophe, survivors must navigate a dangerous new world filled with strange creatures",
    "A time traveler accidentally changes history and must find a way to set things right",
    "In a society where emotions are illegal, a rebel group fights to restore humanity's right to feel",
  ];
  return setups[Math.floor(Math.random() * setups.length)];
}

function generateRandomTheme(): string {
  const themes = [
    "Redemption",
    "Coming of age",
    "Good vs. evil",
    "Love conquers all",
    "Power corrupts",
    "Identity and self-discovery",
  ];
  return themes[Math.floor(Math.random() * themes.length)];
}

function generateRandomConflict(): string {
  const conflicts = [
    "Man vs. nature",
    "Man vs. society",
    "Man vs. self",
    "Man vs. technology",
    "Man vs. fate",
  ];
  return conflicts[Math.floor(Math.random() * conflicts.length)];
}

function getRandomGenre(): string {
  const genres = [
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Romance",
    "Horror",
    "Thriller",
    "Historical Fiction",
    "Literary Fiction",
  ];
  return genres[Math.floor(Math.random() * genres.length)];
}

function getRandomDifficulty(): string {
  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

function getRandomPromptType(): string {
  const types = [
    "Character",
    "Setting",
    "Plot",
    "Dialogue",
    "First Line",
    "What If",
  ];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomWordCount(): number {
  const wordCounts = [100, 250, 500, 1000, 1500, 2000];
  return wordCounts[Math.floor(Math.random() * wordCounts.length)];
}

function generateRandomNames(
  nameType: string,
  culture: string,
  userId: string | null,
): any[] {
  const firstNames = [
    "Aria",
    "Zara",
    "Kai",
    "Luna",
    "Dex",
    "Nova",
    "Orion",
    "Maya",
    "Finn",
    "Phoenix",
  ];
  const lastNames = [
    "Stormwind",
    "Shadowbane",
    "Goldleaf",
    "Ironforge",
    "Moonwhisper",
    "Starfall",
    "Bloodmoon",
    "Frostborn",
    "Earthshaker",
    "Voidwalker",
  ];

  const names = [];
  for (let i = 0; i < 10; i++) {
    names.push({
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      nameType,
      culture,
      userId,
    });
  }
  return names;
}

function generateRandomConflictTitle(): string {
  const titles = [
    "The Great Divide",
    "Shadows of Betrayal",
    "The Last Stand",
    "Broken Alliances",
    "The Price of Power",
    "Echoes of War",
    "The Final Choice",
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateRandomConflictType(): string {
  const types = [
    "Internal",
    "Interpersonal",
    "External",
    "Societal",
    "Supernatural",
    "Moral",
  ];
  return types[Math.floor(Math.random() * types.length)];
}

function generateRandomConflictDescription(): string {
  const descriptions = [
    "A deep-seated disagreement that threatens to tear apart everything the characters hold dear",
    "An ancient rivalry that resurfaces at the worst possible moment",
    "A moral dilemma that forces characters to choose between their values and survival",
    "A power struggle that reveals the true nature of those involved",
    "A secret that, once revealed, changes everything",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomStakes(): string {
  const stakes = [
    "The fate of the kingdom hangs in the balance",
    "Lives of innocent people are at risk",
    "The character's deepest relationships are threatened",
    "Everything they've worked for could be lost",
    "The very fabric of reality might be torn apart",
  ];
  return stakes[Math.floor(Math.random() * stakes.length)];
}

function generateRandomObstacles(): string {
  const obstacles = [
    "Powerful enemies who will stop at nothing",
    "Time is running out before disaster strikes",
    "The character's own fears and doubts",
    "Limited resources and impossible odds",
    "Conflicting loyalties that create difficult choices",
  ];
  return obstacles[Math.floor(Math.random() * obstacles.length)];
}

function generateRandomResolutions(): string {
  const resolutions = [
    "A sacrifice that saves everyone but costs everything",
    "Finding an unexpected ally in a former enemy",
    "Discovering inner strength to overcome the impossible",
    "A clever plan that turns weakness into strength",
    "Learning that some conflicts can only be resolved through understanding",
  ];
  return resolutions[Math.floor(Math.random() * resolutions.length)];
}

function generateRandomEmotionalImpact(): string {
  const impacts = [
    "Forces characters to confront their deepest fears",
    "Reveals hidden strengths and vulnerabilities",
    "Tests the bonds of friendship and loyalty",
    "Challenges long-held beliefs and assumptions",
    "Creates lasting change in how characters see the world",
  ];
  return impacts[Math.floor(Math.random() * impacts.length)];
}

function generateRandomThemeTitle(): string {
  const titles = [
    "The Power of Forgiveness",
    "Identity and Belonging",
    "The Cost of Ambition",
    "Love in Dark Times",
    "The Nature of Sacrifice",
    "Finding Hope in Despair",
    "The Burden of Legacy",
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateRandomThemeDescription(): string {
  const descriptions = [
    "An exploration of what it means to be human in challenging circumstances",
    "The universal struggle between personal desires and greater responsibility",
    "How individuals respond when their core beliefs are tested",
    "The transformative power of relationships and connection",
    "The price we pay for the choices we make",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomCoreMessage(): string {
  const messages = [
    "True strength comes from facing our vulnerabilities",
    "The most powerful force in the universe is compassion",
    "Sometimes losing everything is the only way to find yourself",
    "The greatest battles are fought within our own hearts",
    "Hope can survive in even the darkest circumstances",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateRandomSymbolicElements(): string {
  const elements = [
    "Light and darkness representing knowledge and ignorance",
    "Bridges symbolizing connection and transition",
    "Storms as metaphors for internal turmoil",
    "Gardens representing growth and nurturing",
    "Mirrors reflecting self-discovery and truth",
  ];
  return elements[Math.floor(Math.random() * elements.length)];
}

function generateRandomThematicQuestions(): string {
  const questions = [
    "What does it mean to be truly free?",
    "How do we find meaning in suffering?",
    "What is the difference between justice and revenge?",
    "Can love survive betrayal?",
    "What price are we willing to pay for our dreams?",
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateRandomThematicConflicts(): string {
  const conflicts = [
    "Individual desires versus collective needs",
    "Tradition versus progress and change",
    "The known versus the unknown",
    "Safety versus adventure and growth",
    "Truth versus comfortable illusions",
  ];
  return conflicts[Math.floor(Math.random() * conflicts.length)];
}

function generateRandomLiteraryExamples(): string {
  const examples = [
    "Like Atticus Finch standing up for justice despite social pressure",
    "Similar to Elizabeth Bennet overcoming her prejudices",
    "Reminiscent of Jean Valjean's journey toward redemption",
    "Echoing Frodo's burden and the corrupting power of the Ring",
    "Parallel to Scout Finch's loss of innocence",
  ];
  return examples[Math.floor(Math.random() * examples.length)];
}

function generateRandomMoodName(): string {
  const names = [
    "Melancholy Twilight",
    "Electric Anticipation",
    "Cozy Contemplation",
    "Ethereal Wonder",
    "Tense Uncertainty",
    "Nostalgic Warmth",
    "Mysterious Allure",
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function generateRandomMoodDescription(): string {
  const descriptions = [
    "A bittersweet atmosphere that evokes memories of things lost and found",
    "An energetic feeling that makes everything seem possible",
    "A peaceful state of mind where thoughts flow freely",
    "A dreamlike quality that blurs the line between reality and imagination",
    "A charged atmosphere where anything could happen",
    "A comfortable familiarity that feels like coming home",
    "An intriguing ambiance that draws you deeper into the story",
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomEmotionalTone(): string {
  const tones = [
    "Hopeful",
    "Melancholic",
    "Mysterious",
    "Energetic",
    "Peaceful",
    "Tense",
    "Romantic",
  ];
  return tones[Math.floor(Math.random() * tones.length)];
}

function generateRandomSensoryDetails(): string {
  const details = [
    "The scent of rain on warm earth",
    "Soft candlelight flickering against stone walls",
    "The distant sound of ocean waves",
    "Cool morning mist and fresh pine",
    "The warmth of sunlight through autumn leaves",
  ];
  return details[Math.floor(Math.random() * details.length)];
}

function generateRandomColorAssociations(): string {
  const colors = [
    "Deep blues and silver",
    "Warm golds and amber",
    "Rich purples and violet",
    "Soft greens and cream",
    "Dusky rose and charcoal",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateRandomWeatherElements(): string {
  const weather = [
    "Gentle rainfall",
    "Golden sunset",
    "Misty morning",
    "Starlit night",
    "Autumn breeze",
  ];
  return weather[Math.floor(Math.random() * weather.length)];
}

function generateRandomLightingEffects(): string {
  const lighting = [
    "Soft, diffused light",
    "Dramatic shadows",
    "Warm, glowing ambiance",
    "Cool, ethereal illumination",
    "Flickering, unstable light",
  ];
  return lighting[Math.floor(Math.random() * lighting.length)];
}

function generateRandomSoundscape(): string {
  const sounds = [
    "Distant thunder and rain",
    "Gentle wind through trees",
    "Crackling fireplace",
    "Soft instrumental music",
    "Echoing footsteps in empty halls",
  ];
  return sounds[Math.floor(Math.random() * sounds.length)];
}
