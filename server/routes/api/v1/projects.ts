import { Router } from "express";
import {
  apiAuthMiddleware,
  requireScope,
  addRateLimitHeaders,
  ApiAuthRequest,
} from "../../../middleware/apiAuthMiddleware";
import { storage } from "../../../storage";
import {
  readRateLimiter,
  writeRateLimiter,
} from "../../../security/rateLimiters";

const router = Router();

// Apply API authentication to all routes
router.use(apiAuthMiddleware);
router.use(addRateLimitHeaders);

/**
 * List all projects for the authenticated user
 * GET /api/v1/projects
 */
router.get("/", readRateLimiter, async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;

    const projects = await storage.getUserProjects(userId);

    res.json({
      projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      error: "Failed to fetch projects",
    });
  }
});

/**
 * Get a specific project by ID
 * GET /api/v1/projects/:id
 */
router.get("/:id", readRateLimiter, async (req: ApiAuthRequest, res) => {
  try {
    const userId = req.apiKey!.userId;
    const projectId = req.params.id;

    const project = await storage.getProject(projectId, userId);

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({
      error: "Failed to fetch project",
    });
  }
});

/**
 * Create a new project
 * POST /api/v1/projects
 */
router.post(
  "/",
  writeRateLimiter,
  requireScope("write"),
  async (req: ApiAuthRequest, res) => {
    try {
      const userId = req.apiKey!.userId;

      const project = await storage.createProject({
        ...req.body,
        userId,
      });

      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({
        error: "Failed to create project",
      });
    }
  },
);

/**
 * Update a project
 * PATCH /api/v1/projects/:id
 */
router.patch(
  "/:id",
  writeRateLimiter,
  requireScope("write"),
  async (req: ApiAuthRequest, res) => {
    try {
      const userId = req.apiKey!.userId;
      const projectId = req.params.id;

      const project = await storage.updateProject(projectId, userId, req.body);

      if (!project) {
        return res.status(404).json({
          error: "Project not found",
        });
      }

      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({
        error: "Failed to update project",
      });
    }
  },
);

/**
 * Delete a project
 * DELETE /api/v1/projects/:id
 */
router.delete(
  "/:id",
  writeRateLimiter,
  requireScope("write"),
  async (req: ApiAuthRequest, res) => {
    try {
      const userId = req.apiKey!.userId;
      const projectId = req.params.id;

      await storage.deleteProject(projectId, userId);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({
        error: "Failed to delete project",
      });
    }
  },
);

export default router;
