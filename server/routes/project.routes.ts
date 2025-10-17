import { Router } from "express";
import { storage } from "../storage";
import { insertProjectSchema, insertProjectSectionSchema, type ProjectSection, type ProjectSectionWithChildren } from "@shared/schema";
import { z } from "zod";
import { validateInput } from "../security/middleware";
import { requireFeature } from "../middleware/featureGate";

const router = Router();

// Helper to build tree structure from flat list
function buildTree(sections: ProjectSection[]): ProjectSectionWithChildren[] {
  const map = new Map<string, ProjectSectionWithChildren>();
  const roots: ProjectSectionWithChildren[] = [];

  // First pass: create map
  sections.forEach(section => {
    map.set(section.id, { ...section, children: [] });
  });

  // Second pass: build tree
  sections.forEach(section => {
    const node = map.get(section.id)!;
    if (section.parentId) {
      const parent = map.get(section.parentId);
      if (parent) {
        parent.children!.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // Sort by position
  const sortByPosition = (nodes: ProjectSectionWithChildren[]) => {
    nodes.sort((a, b) => a.position - b.position);
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        sortByPosition(node.children);
      }
    });
  };

  sortByPosition(roots);
  return roots;
}

router.get("/", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const projects = await storage.getUserProjects(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      console.warn(`[Security] Unauthorized project operation - userId: ${userId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post("/", requireFeature('create_project'), validateInput(insertProjectSchema.omit({ userId: true })), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const projectData = { ...req.body, userId };

    const savedProject = await storage.createProject(projectData);
    res.json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get("/search", async (req: any, res) => {
  try {
    const query = req.query.q as string;
    const userId = req.user.claims.sub;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await storage.searchProjects(userId, query);
    res.json(results);
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const project = await storage.getProject(req.params.id, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.put("/:id", validateInput(insertProjectSchema.omit({ userId: true }).partial()), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const updateData = { ...req.body, userId };

    const updatedProject = await storage.updateProject(req.params.id, userId, updateData);

    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const projectId = req.params.id || 'unknown';
      console.warn(`[Security] Unauthorized project operation - userId: ${userId}, projectId: ${projectId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteProject(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const projectId = req.params.id || 'unknown';
      console.warn(`[Security] Unauthorized project operation - userId: ${userId}, projectId: ${projectId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Project Section routes
router.get("/:projectId/sections", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { projectId } = req.params;
    const { flat } = req.query;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const sections = await storage.getProjectSections(projectId);

    // Return tree structure by default, flat list if ?flat=true
    if (flat === 'true') {
      res.json(sections);
    } else {
      const tree = buildTree(sections);
      res.json(tree);
    }
  } catch (error) {
    console.error('Error fetching project sections:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const projectId = req.params.projectId || 'unknown';
      console.warn(`[Security] Unauthorized project operation - userId: ${userId}, projectId: ${projectId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to fetch project sections' });
  }
});

router.post("/:projectId/sections", validateInput(insertProjectSectionSchema.omit({ projectId: true })), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { projectId } = req.params;
    const { parentId, type } = req.body;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Validate type
    if (type !== 'folder' && type !== 'page') {
      return res.status(400).json({ error: 'Type must be folder or page' });
    }

    // Validate nesting: pages cannot have children
    if (parentId) {
      const parent = await storage.getProjectSection(parentId, projectId);
      if (parent && parent.type === 'page') {
        return res.status(400).json({ error: 'Cannot nest sections under a page' });
      }
    }

    const sectionData = { ...req.body, projectId };
    const savedSection = await storage.createProjectSection(sectionData);
    res.json(savedSection);
  } catch (error) {
    console.error('Error creating project section:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

router.get("/:projectId/sections/:sectionId", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { projectId, sectionId } = req.params;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const section = await storage.getProjectSection(sectionId, projectId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching project section:', error);
    res.status(500).json({ error: 'Failed to fetch project section' });
  }
});

router.put("/:projectId/sections/:sectionId", validateInput(insertProjectSectionSchema.omit({ projectId: true }).partial()), async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { projectId, sectionId } = req.params;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedSection = await storage.updateProjectSection(sectionId, projectId, req.body);

    if (!updatedSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Recalculate project word count after section update
    const allSections = await storage.getProjectSections(projectId);
    const totalWords = calculateTotalWords(allSections);
    await storage.updateProject(projectId, userId, { wordCount: totalWords });

    res.json(updatedSection);
  } catch (error) {
    console.error('Error updating project section:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const projectId = req.params.projectId || 'unknown';
      const sectionId = req.params.sectionId || 'unknown';
      console.warn(`[Security] Unauthorized project operation - userId: ${userId}, projectId: ${projectId}, sectionId: ${sectionId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to update section' });
  }
});

router.delete("/:projectId/sections/:sectionId", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { projectId, sectionId } = req.params;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await storage.deleteProjectSection(sectionId, projectId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project section:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const projectId = req.params.projectId || 'unknown';
      const sectionId = req.params.sectionId || 'unknown';
      console.warn(`[Security] Unauthorized project operation - userId: ${userId}, projectId: ${projectId}, sectionId: ${sectionId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

router.post("/:projectId/sections/reorder", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const { projectId } = req.params;

    // Verify user owns the project
    const project = await storage.getProject(projectId, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const { sectionOrders } = req.body;

    if (!Array.isArray(sectionOrders)) {
      return res.status(400).json({ error: 'sectionOrders must be an array' });
    }

    await storage.reorderProjectSections(projectId, sectionOrders);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering project sections:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const projectId = req.params.projectId || 'unknown';
      console.warn(`[Security] Unauthorized project operation - userId: ${userId}, projectId: ${projectId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
});

// Helper function to calculate total words from all sections
function calculateTotalWords(sections: any[]): number {
  let total = 0;
  for (const section of sections) {
    if (section.type === 'page' && section.content) {
      const text = section.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      total += text.split(' ').filter((w: string) => w.length > 0).length;
    }
  }
  return total;
}

export default router;
