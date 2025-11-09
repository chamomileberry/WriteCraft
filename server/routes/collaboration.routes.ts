import { Router, Request, Response } from "express";
import { getRoomUsers, getActiveRooms } from "../collaboration";
import { db } from "../db";
import { shares, users, projects } from "../../shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import { collaborationRateLimiter } from "../security/rateLimiters";

const router = Router();

// Get active collaborators for a document
router.get(
  "/rooms/:resourceType/:resourceId/users",
  collaborationRateLimiter,
  async (
    req: Request<{ resourceType: string; resourceId: string }>,
    res: Response,
  ) => {
    try {
      const { resourceType, resourceId } = req.params;
      if (!resourceId) {
        return res.status(400).json({ message: "Missing resourceId" });
      }
      const userId = (req as any).user.id;

      // Verify user has access to this resource
      if (resourceType === "project") {
        const project = await db.query.projects.findFirst({
          where: eq(projects.id, resourceId),
        });

        if (!project) {
          return res.status(404).json({ message: "Resource not found" });
        }

        // Check if user owns or has access via sharing
        const hasAccess =
          project.userId === userId ||
          (await db.query.shares.findFirst({
            where: and(
              eq(shares.resourceType, "project"),
              eq(shares.resourceId, project.id),
              eq(shares.userId, userId),
            ),
          }));

        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const docName = `${resourceType}:${resourceId}`;
      const userIds = getRoomUsers(docName);

      // Fetch user details
      const userDetails =
        userIds.length > 0
          ? await db.query.users.findMany({
              where: inArray(users.id, userIds),
              columns: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                profileImageUrl: true,
              },
            })
          : [];

      res.json({
        documentId: resourceId,
        activeUsers: userDetails,
        count: userDetails.length,
      });
    } catch (error: any) {
      console.error("[Collaboration API] Error getting room users:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to get active users" });
    }
  },
);

// Get all active rooms (admin only)
router.get(
  "/rooms",
  collaborationRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const activeRooms = getActiveRooms();

      res.json({
        rooms: activeRooms,
        count: activeRooms.length,
      });
    } catch (error: any) {
      console.error("[Collaboration API] Error getting active rooms:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to get active rooms" });
    }
  },
);

router.get(
  "/projects/:projectId/activity",
  collaborationRateLimiter,
  async (req: Request<{ projectId: string }>, res: Response) => {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        return res.status(400).json({ message: "Missing projectId" });
      }
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user has access to this project
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check access
      const hasAccess =
        project.userId === userId ||
        (await db.query.shares.findFirst({
          where: and(
            eq(shares.resourceType, "project"),
            eq(shares.resourceId, projectId),
            eq(shares.userId, userId),
          ),
        }));

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get activity log
      const { projectActivity } = await import("../../shared/schema");
      const { desc } = await import("drizzle-orm");
      const activities = await db.query.projectActivity.findMany({
        where: eq(projectActivity.projectId, projectId),
        orderBy: desc(projectActivity.createdAt),
        limit: 100,
      });

      res.json({ activities });
    } catch (error: any) {
      console.error("[Collaboration API] Error fetching activity log:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to fetch activity log" });
    }
  },
);

router.get(
  "/projects/:projectId/versions",
  collaborationRateLimiter,
  async (req: Request<{ projectId: string }>, res: Response) => {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        return res.status(400).json({ message: "Missing projectId" });
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const hasAccess =
        project.userId === userId ||
        (await db.query.shares.findFirst({
          where: and(
            eq(shares.resourceType, "project"),
            eq(shares.resourceId, projectId),
            eq(shares.userId, userId),
          ),
        }));
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { projectVersions } = await import("../../shared/schema");
      const { desc } = await import("drizzle-orm");
      const versions = await db.query.projectVersions.findMany({
        where: eq(projectVersions.projectId, projectId),
        orderBy: desc(projectVersions.createdAt),
        limit: 50,
      });

      res.json({ versions });
    } catch (error: any) {
      console.error("[Collaboration API] Error fetching versions:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to fetch versions" });
    }
  },
);

router.post(
  "/projects/:projectId/versions",
  collaborationRateLimiter,
  async (req: Request<{ projectId: string }>, res: Response) => {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        return res.status(400).json({ message: "Missing projectId" });
      }

      const { label } = req.body;
      const userId = (req as any).user?.id;
      const user = (req as any).user;
      const userName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
        : "Unknown";

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Check if user is owner or has edit permission
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== userId) {
        const hasEditAccess = await db.query.shares.findFirst({
          where: and(
            eq(shares.resourceType, "project"),
            eq(shares.resourceId, projectId),
            eq(shares.userId, userId),
            eq(shares.permission, "edit"),
          ),
        });

        if (!hasEditAccess) {
          return res.status(403).json({ message: "Edit permission required" });
        }
      }

      // Create snapshot
      const { projectVersions, projectActivity } = await import(
        "../../shared/schema"
      );
      const { desc } = await import("drizzle-orm");

      // Get the latest version number
      const latestVersion = await db.query.projectVersions.findFirst({
        where: eq(projectVersions.projectId, projectId),
        orderBy: [desc(projectVersions.versionNumber)],
      });

      const versionNumber = (latestVersion?.versionNumber ?? 0) + 1;

      const [version] = await db
        .insert(projectVersions)
        .values({
          projectId,
          userId,
          title: project.title,
          content: project.content || "",
          wordCount: project.wordCount ?? 0,
          versionNumber,
          versionType: "manual",
          versionLabel: label || `Manual snapshot by ${userName}`,
        })
        .returning();

      if (!version) {
        throw new Error("Failed to create version");
      }

      // Log activity
      await db.insert(projectActivity).values({
        projectId,
        userId,
        userName,
        activityType: "version",
        description: `Created snapshot: ${version.versionLabel || "Untitled"}`,
        metadata: { versionId: version.id },
      });

      res.json({ version });
    } catch (error: any) {
      console.error("[Collaboration API] Error creating version:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to create version" });
    }
  },
);

router.post(
  "/projects/:projectId/versions/:versionId/restore",
  collaborationRateLimiter,
  async (
    req: Request<{ projectId: string; versionId: string }>,
    res: Response,
  ) => {
    try {
      const { projectId, versionId } = req.params;
      if (!projectId) {
        return res.status(400).json({ message: "Missing projectId" });
      }
      const userId = (req as any).user?.id;
      const user = (req as any).user;
      const userName =
        user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
          : "Unknown";

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });
      if (!project || project.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Only owner can restore versions" });
      }

      const { projectVersions, projectActivity } = await import(
        "../../shared/schema"
      );
      const version = await db.query.projectVersions.findFirst({
        where: and(
          eq(projectVersions.id, versionId),
          eq(projectVersions.projectId, projectId),
        ),
      });
      if (!version) {
        return res.status(404).json({ message: "Version not found" });
      }

      await db
        .update(projects)
        .set({
          content: version.content,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));

      await db.insert(projectActivity).values({
        projectId,
        userId,
        userName,
        activityType: "version",
        description: `Restored version: ${version.versionLabel || "Untitled"}`,
        metadata: { versionId: version.id },
      });

      res.json({ success: true, version });
    } catch (error: any) {
      console.error("[Collaboration API] Error restoring version:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to restore version" });
    }
  },
);

router.get(
  "/projects/:projectId/pending-changes",
  collaborationRateLimiter,
  async (req: Request<{ projectId: string }>, res: Response) => {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        return res.status(400).json({ message: "Missing projectId" });
      }

      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });
      if (!project || project.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Only owner can view pending changes" });
      }

      const { pendingChanges } = await import("../../shared/schema");
      const { desc } = await import("drizzle-orm");
      const changes = await db.query.pendingChanges.findMany({
        where: and(
          eq(pendingChanges.projectId, projectId),
          eq(pendingChanges.status, "pending"),
        ),
        orderBy: desc(pendingChanges.createdAt),
      });

      res.json({ changes });
    } catch (error: any) {
      console.error("[Collaboration API] Error fetching pending changes:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to fetch pending changes" });
    }
  },
);

// Approve/reject change
router.post(
  "/projects/:projectId/pending-changes/:changeId/:action",
  collaborationRateLimiter,
  async (
    req: Request<{
      projectId: string;
      changeId: string;
      action: "approve" | "reject";
    }>,
    res: Response,
  ) => {
    try {
      const { projectId, changeId, action } = req.params;
      if (!projectId) {
        return res.status(400).json({ message: "Missing projectId" });
      }
      const userId = (req as any).user?.id;
      const user = (req as any).user;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userName =
        user
          ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
          : "Unknown";

      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });
      if (!project || project.userId !== userId) {
        return res
          .status(403)
          .json({ message: "Only owner can approve/reject changes" });
      }

      const { pendingChanges, projectActivity } = await import(
        "../../shared/schema"
      );
      const change = await db.query.pendingChanges.findFirst({
        where: and(
          eq(pendingChanges.id, changeId),
          eq(pendingChanges.projectId, projectId),
        ),
      });
      if (!change) {
        return res.status(404).json({ message: "Change not found" });
      }

      const newStatus = action === "approve" ? "approved" : "rejected";
      await db
        .update(pendingChanges)
        .set({
          status: newStatus,
          reviewedBy: userId,
          reviewedAt: new Date(),
        })
        .where(eq(pendingChanges.id, changeId));

      await db.insert(projectActivity).values({
        projectId,
        userId,
        userName,
        activityType: "review",
        description: `${action === "approve" ? "Approved" : "Rejected"} change from ${change.userName}`,
        metadata: { changeId: change.id, action },
      });

      res.json({ success: true, change: { ...change, status: newStatus } });
    } catch (error: any) {
      console.error("[Collaboration API] Error updating change:", error);
      res
        .status(500)
        .json({ message: error.message || "Failed to update change" });
    }
  },
);
