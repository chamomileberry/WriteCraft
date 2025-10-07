import { Router } from "express";
import { storage } from "../storage";
import { 
  insertFamilyTreeSchema, 
  insertFamilyTreeMemberSchema, 
  insertFamilyTreeRelationshipSchema 
} from "@shared/schema";
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
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    // Add userId to the request body and extract only the fields that exist in the schema
    const familyTreeData = {
      name: req.body.name,
      description: req.body.description,
      layoutMode: req.body.layoutMode,
      zoom: req.body.zoom,
      userId,
      notebookId
    };
    
    const validatedFamilyTree = insertFamilyTreeSchema.parse(familyTreeData);
    const savedFamilyTree = await storage.createFamilyTree(validatedFamilyTree);
    res.json(savedFamilyTree);
  } catch (error) {
    console.error('Error saving family tree:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to save family tree' });
  }
});

router.get("/", async (req: any, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.user.claims.sub;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const familyTrees = await storage.getUserFamilyTrees(userId, notebookId);
    
    // Filter by search text if provided
    if (search) {
      const filtered = familyTrees.filter((item: any) =>
        item.name?.toLowerCase().includes(search.toLowerCase())
      );
      res.json(filtered);
    } else {
      res.json(familyTrees);
    }
  } catch (error) {
    console.error('Error fetching family trees:', error);
    res.status(500).json({ error: 'Failed to fetch family trees' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const familyTrees = await storage.getUserFamilyTrees(userId, notebookId);
    res.json(familyTrees);
  } catch (error) {
    console.error('Error fetching family trees:', error);
    res.status(500).json({ error: 'Failed to fetch family trees' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const familyTree = await storage.getFamilyTree(req.params.id, userId, notebookId);
    if (!familyTree) {
      return res.status(404).json({ error: 'Family tree not found' });
    }
    res.json(familyTree);
  } catch (error) {
    console.error('Error fetching family tree:', error);
    res.status(500).json({ error: 'Failed to fetch family tree' });
  }
});

router.put("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.body.notebookId || req.query.notebookId;
    
    // Extract only the fields that are provided (filter out undefined)
    const familyTreeData: any = {
      userId,
      notebookId
    };
    
    if (req.body.name !== undefined) familyTreeData.name = req.body.name;
    if (req.body.description !== undefined) familyTreeData.description = req.body.description;
    if (req.body.layoutMode !== undefined) familyTreeData.layoutMode = req.body.layoutMode;
    if (req.body.zoom !== undefined) familyTreeData.zoom = req.body.zoom;
    
    const validatedUpdates = insertFamilyTreeSchema.partial().parse(familyTreeData);
    const updatedFamilyTree = await storage.updateFamilyTree(req.params.id, userId, validatedUpdates);
    res.json(updatedFamilyTree);
  } catch (error) {
    console.error('Error updating family tree:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    await storage.deleteFamilyTree(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting family tree:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || req.body.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized operation - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to delete family tree' });
  }
});

// Family Tree Member Routes
router.post("/:treeId/members", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const treeId = req.params.treeId;
    
    // Validate tree ownership before allowing member creation
    const tree = await storage.getFamilyTree(treeId, userId, req.body.notebookId || req.query.notebookId);
    if (!tree) {
      console.warn(`[Security] Unauthorized tree access attempt - userId: ${userId}, treeId: ${treeId}`);
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const validatedMember = insertFamilyTreeMemberSchema.parse({ ...req.body, treeId });
    const savedMember = await storage.createFamilyTreeMember(validatedMember);
    res.json(savedMember);
  } catch (error) {
    console.error('Error creating family tree member:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      console.warn(`[Security] Unauthorized operation - userId: ${req.user?.claims?.sub}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to create family tree member' });
  }
});

router.get("/:treeId/members", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const treeId = req.params.treeId;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Fetch tree first to validate ownership
    const tree = await storage.getFamilyTree(treeId, userId, notebookId);
    if (!tree) {
      console.warn(`[Security] Unauthorized tree access attempt - userId: ${userId}, treeId: ${treeId}`);
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const members = await storage.getFamilyTreeMembers(treeId, userId);
    res.json(members);
  } catch (error) {
    console.error('Error fetching family tree members:', error);
    res.status(500).json({ error: 'Failed to fetch family tree members' });
  }
});

router.put("/:treeId/members/:memberId", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const treeId = req.params.treeId;
    const memberId = req.params.memberId;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Fetch tree first to validate ownership
    const tree = await storage.getFamilyTree(treeId, userId, notebookId);
    if (!tree) {
      console.warn(`[Security] Unauthorized tree access attempt - userId: ${userId}, treeId: ${treeId}`);
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const validatedUpdates = insertFamilyTreeMemberSchema.partial().parse(req.body);
    const updatedMember = await storage.updateFamilyTreeMember(memberId, userId, validatedUpdates);
    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating family tree member:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update family tree member' });
  }
});

router.delete("/:treeId/members/:memberId", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const treeId = req.params.treeId;
    const memberId = req.params.memberId;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Fetch tree first to validate ownership
    const tree = await storage.getFamilyTree(treeId, userId, notebookId);
    if (!tree) {
      console.warn(`[Security] Unauthorized tree access attempt - userId: ${userId}, treeId: ${treeId}`);
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    await storage.deleteFamilyTreeMember(memberId, userId, treeId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting family tree member:', error);
    res.status(500).json({ error: 'Failed to delete family tree member' });
  }
});

// Family Tree Relationship Routes
router.post("/:treeId/relationships", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const treeId = req.params.treeId;
    
    // Validate tree ownership before allowing relationship creation
    const tree = await storage.getFamilyTree(treeId, userId, req.body.notebookId || req.query.notebookId);
    if (!tree) {
      console.warn(`[Security] Unauthorized tree access attempt - userId: ${userId}, treeId: ${treeId}`);
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const validatedRelationship = insertFamilyTreeRelationshipSchema.parse({ ...req.body, treeId });
    
    // Validation: Prevent self-links
    if (validatedRelationship.fromMemberId === validatedRelationship.toMemberId) {
      return res.status(400).json({ error: 'A family member cannot have a relationship with themselves' });
    }
    
    // Validation: Prevent duplicate relationships
    const existingRelationships = await storage.getFamilyTreeRelationships(treeId, userId);
    const duplicateExists = existingRelationships.some((rel: any) => 
      (rel.fromMemberId === validatedRelationship.fromMemberId && rel.toMemberId === validatedRelationship.toMemberId) ||
      (rel.fromMemberId === validatedRelationship.toMemberId && rel.toMemberId === validatedRelationship.fromMemberId)
    );
    
    if (duplicateExists) {
      return res.status(400).json({ error: 'A relationship between these family members already exists' });
    }
    
    const savedRelationship = await storage.createFamilyTreeRelationship(validatedRelationship);
    res.json(savedRelationship);
  } catch (error) {
    console.error('Error creating family tree relationship:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      console.warn(`[Security] Unauthorized operation - userId: ${req.user?.claims?.sub}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to create family tree relationship' });
  }
});

router.get("/:treeId/relationships", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const treeId = req.params.treeId;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Fetch tree first to validate ownership
    const tree = await storage.getFamilyTree(treeId, userId, notebookId);
    if (!tree) {
      console.warn(`[Security] Unauthorized tree access attempt - userId: ${userId}, treeId: ${treeId}`);
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const relationships = await storage.getFamilyTreeRelationships(treeId, userId);
    res.json(relationships);
  } catch (error) {
    console.error('Error fetching family tree relationships:', error);
    res.status(500).json({ error: 'Failed to fetch family tree relationships' });
  }
});

router.put("/:treeId/relationships/:relationshipId", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const treeId = req.params.treeId;
    const relationshipId = req.params.relationshipId;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Fetch tree first to validate ownership
    const tree = await storage.getFamilyTree(treeId, userId, notebookId);
    if (!tree) {
      console.warn(`[Security] Unauthorized tree access attempt - userId: ${userId}, treeId: ${treeId}`);
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    const validatedUpdates = insertFamilyTreeRelationshipSchema.partial().parse(req.body);
    const updatedRelationship = await storage.updateFamilyTreeRelationship(relationshipId, userId, validatedUpdates);
    res.json(updatedRelationship);
  } catch (error) {
    console.error('Error updating family tree relationship:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update family tree relationship' });
  }
});

router.delete("/:treeId/relationships/:relationshipId", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const treeId = req.params.treeId;
    const relationshipId = req.params.relationshipId;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Fetch tree first to validate ownership
    const tree = await storage.getFamilyTree(treeId, userId, notebookId);
    if (!tree) {
      console.warn(`[Security] Unauthorized tree access attempt - userId: ${userId}, treeId: ${treeId}`);
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    await storage.deleteFamilyTreeRelationship(relationshipId, userId, treeId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting family tree relationship:', error);
    res.status(500).json({ error: 'Failed to delete family tree relationship' });
  }
});

export default router;
