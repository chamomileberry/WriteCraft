import { db } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  type Project,
  type InsertProject,
  type ProjectSection,
  type InsertProjectSection,
  type ProjectLink,
  type InsertProjectLink,
  projects,
  projectSections,
  projectLinks,
  shares,
  users,
} from "@shared/schema";
import { BaseRepository } from "./base.repository";

export class ProjectRepository extends BaseRepository {
  // Project methods
  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async getProject(id: string, userId: string): Promise<Project | undefined> {
    // First try to get as owner
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));

    if (project) {
      return project;
    }

    // If not owner, check if shared
    const [sharedProject] = await db
      .select({
        project: projects,
      })
      .from(shares)
      .innerJoin(projects, eq(shares.resourceId, projects.id))
      .where(
        and(
          eq(shares.userId, userId),
          eq(shares.resourceType, "project"),
          eq(shares.resourceId, id),
        ),
      );

    return sharedProject?.project || undefined;
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    // Get owned projects with metadata
    const ownedProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));

    // Get shared projects with share metadata
    const sharedProjects = await db
      .select({
        project: projects,
        share: shares,
        owner: users,
      })
      .from(shares)
      .innerJoin(projects, eq(shares.resourceId, projects.id))
      .innerJoin(users, eq(projects.userId, users.id))
      .where(
        and(eq(shares.userId, userId), eq(shares.resourceType, "project")),
      );

    // Add metadata to projects
    const ownedWithMetadata = ownedProjects.map((p) => ({
      ...p,
      isShared: false,
      sharedBy: null,
      sharePermission: null,
    }));

    const sharedWithMetadata = sharedProjects.map((s) => ({
      ...s.project,
      isShared: true,
      sharedBy: {
        id: s.owner.id,
        email: s.owner.email,
        firstName: s.owner.firstName,
        lastName: s.owner.lastName,
        profileImageUrl: s.owner.profileImageUrl,
      },
      sharePermission: s.share.permission,
    }));

    // Combine and return, removing duplicates
    const allProjects = [...ownedWithMetadata, ...sharedWithMetadata];

    // Remove duplicates based on id and sort by updatedAt
    const uniqueProjects = Array.from(
      new Map(allProjects.map((p) => [p.id, p])).values(),
    ).sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return uniqueProjects;
  }

  async updateProject(
    id: string,
    userId: string,
    updates: Partial<InsertProject>,
  ): Promise<Project> {
    // Count words if content is being updated
    if (updates.content) {
      const plainText = (updates.content as string)
        .replace(/<[^<>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const words = plainText
        .split(/\s+/)
        .filter((word: string) => word.length > 0);
      updates.wordCount = words.length;

      // Generate excerpt if not provided
      if (!updates.excerpt && plainText.length > 0) {
        updates.excerpt =
          plainText.substring(0, 150) + (plainText.length > 150 ? "..." : "");
      }
    }

    // Check if user is owner OR has edit permission through sharing
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // Check ownership or edit permission
    const isOwner = project.userId === userId;
    const hasEditPermission =
      !isOwner &&
      (await db.query.shares.findFirst({
        where: and(
          eq(shares.resourceType, "project"),
          eq(shares.resourceId, id),
          eq(shares.userId, userId),
          eq(shares.permission, "edit"),
        ),
      }));

    if (!isOwner && !hasEditPermission) {
      throw new Error("Project not found or access denied");
    }

    const [updatedProject] = await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    if (!updatedProject) {
      throw new Error("Project not found or access denied");
    }

    return updatedProject;
  }

  async deleteProject(id: string, userId: string): Promise<void> {
    const result = await db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, userId)));

    if (result.rowCount === 0) {
      throw new Error("Project not found or access denied");
    }
  }

  async searchProjects(userId: string, query: string): Promise<Project[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return this.getUserProjects(userId);
    }

    // Enhanced full-text search using PostgreSQL tsvector with ranking
    const searchQuery = sql`plainto_tsquery('english', ${trimmedQuery})`;
    return await db
      .select({
        id: projects.id,
        title: projects.title,
        content: projects.content,
        excerpt: projects.excerpt,
        wordCount: projects.wordCount,
        tags: projects.tags,
        status: projects.status,
        searchVector: projects.searchVector,
        folderId: projects.folderId,
        userId: projects.userId,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        rank: sql<number>`ts_rank(${projects.searchVector}, ${searchQuery})`.as(
          "rank",
        ),
      })
      .from(projects)
      .where(
        and(
          eq(projects.userId, userId),
          sql`${projects.searchVector} @@ ${searchQuery}`,
        ),
      )
      .orderBy(desc(sql`ts_rank(${projects.searchVector}, ${searchQuery})`));
  }

  // Project Section methods
  async createProjectSection(
    section: InsertProjectSection,
  ): Promise<ProjectSection> {
    const [result] = await db
      .insert(projectSections)
      .values(section)
      .returning();
    return result;
  }

  async getProjectSection(
    id: string,
    projectId: string,
  ): Promise<ProjectSection | undefined> {
    const [section] = await db
      .select()
      .from(projectSections)
      .where(
        and(
          eq(projectSections.id, id),
          eq(projectSections.projectId, projectId),
        ),
      );
    return section || undefined;
  }

  async getProjectSections(projectId: string): Promise<ProjectSection[]> {
    return await db
      .select()
      .from(projectSections)
      .where(eq(projectSections.projectId, projectId))
      .orderBy(projectSections.position);
  }

  async updateProjectSection(
    id: string,
    projectId: string,
    updates: Partial<InsertProjectSection>,
  ): Promise<ProjectSection> {
    const [updatedSection] = await db
      .update(projectSections)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectSections.id, id),
          eq(projectSections.projectId, projectId),
        ),
      )
      .returning();

    if (!updatedSection) {
      throw new Error("Section not found");
    }

    return updatedSection;
  }

  async deleteProjectSection(id: string, projectId: string): Promise<void> {
    await db
      .delete(projectSections)
      .where(
        and(
          eq(projectSections.id, id),
          eq(projectSections.projectId, projectId),
        ),
      );
  }

  async reorderProjectSections(
    projectId: string,
    sectionOrders: { id: string; position: number; parentId?: string | null }[],
  ): Promise<void> {
    // Update positions (and optionally parentId) for each section
    for (const { id, position, parentId } of sectionOrders) {
      const updates: any = { position, updatedAt: new Date() };

      // Only update parentId if it's explicitly provided
      if (parentId !== undefined) {
        updates.parentId = parentId;
      }

      await db
        .update(projectSections)
        .set(updates)
        .where(
          and(
            eq(projectSections.id, id),
            eq(projectSections.projectId, projectId),
          ),
        );
    }
  }

  // Project link methods (stub implementations)
  async createProjectLink(link: InsertProjectLink): Promise<ProjectLink> {
    throw new Error("ProjectLink functionality not yet implemented");
  }

  async getProjectLinks(
    projectId: string,
    userId: string,
  ): Promise<ProjectLink[]> {
    return [];
  }

  async getProjectLinksForUser(userId: string): Promise<ProjectLink[]> {
    return [];
  }

  async deleteProjectLink(id: string, userId: string): Promise<void> {
    // Stub - no-op
  }
}
