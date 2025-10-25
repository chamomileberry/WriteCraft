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

// GET /api/family-trees - Get all family trees across all notebooks (when no notebookId provided)
router.get("/", async (req: any, res) => {
  try {
    const search = req.query.search as string;
    const notebookId = req.query.notebookId as string;
    const userId = req.user.claims.sub;
    
    // If no notebookId, return all family trees across all notebooks
    if (!notebookId) {
      // Get all user notebooks
      const notebooks = await storage.getUserNotebooks(userId);
      
      // Get family trees from all notebooks
      const allFamilyTrees = [];
      for (const notebook of notebooks) {
        const familyTrees = await storage.getUserFamilyTrees(userId, notebook.id);
        allFamilyTrees.push(...familyTrees);
      }
      
      // Filter by search if provided
      if (search) {
        const filtered = allFamilyTrees.filter((item: any) =>
          item.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(allFamilyTrees);
      }
      return;
    }
    
    // If notebookId provided, get family trees for specific notebook
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

// Add related family member with automatic positioning
router.post("/:treeId/members/add-related", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const treeId = req.params.treeId;
    const { relativeMemberId, relationshipType, characterId, inlineName } = req.body;
    
    // Validate tree ownership
    const tree = await storage.getFamilyTree(treeId, userId, req.body.notebookId || req.query.notebookId);
    if (!tree) {
      console.warn(`[Security] Unauthorized tree access attempt - userId: ${userId}, treeId: ${treeId}`);
      return res.status(404).json({ error: 'Tree not found' });
    }
    
    // Validate required fields
    if (!relativeMemberId || !relationshipType) {
      return res.status(400).json({ error: 'relativeMemberId and relationshipType are required' });
    }
    
    // Validate that either characterId or inlineName is provided
    if (!characterId && !inlineName) {
      return res.status(400).json({ error: 'Either characterId or inlineName must be provided' });
    }
    
    // Validate relationship type
    const validRelationshipTypes = ['parent', 'spouse', 'child', 'sibling', 'adoption', 'stepParent', 'grandparent', 'cousin'];
    if (!validRelationshipTypes.includes(relationshipType)) {
      return res.status(400).json({ error: 'Invalid relationship type. Must be one of: parent, spouse, child, sibling, adoption, stepParent, grandparent, cousin' });
    }
    
    // Get the relative member to calculate position
    const members = await storage.getFamilyTreeMembers(treeId, userId);
    const relativeMember = members.find((m: any) => m.id === relativeMemberId);
    
    if (!relativeMember) {
      return res.status(404).json({ error: 'Relative member not found' });
    }
    
    // Calculate position based on relationship type
    const relativeX = relativeMember.positionX || 0;
    const relativeY = relativeMember.positionY || 0;
    let positionX: number;
    let positionY: number;
    
    // Get existing relationships for parent positioning logic
    const existingRelationships = await storage.getFamilyTreeRelationships(treeId, userId);
    const existingParents = existingRelationships.filter((rel: any) => 
      rel.toMemberId === relativeMemberId && (rel.relationshipType === 'parent' || rel.relationshipType === 'adoption' || rel.relationshipType === 'stepParent')
    );
    
    switch (relationshipType) {
      case 'parent':
        // Check if child already has parents
        
        if (existingParents.length === 0) {
          // First parent - center above child
          positionX = relativeX;
          positionY = relativeY - 200;
        } else {
          // Find the existing parent member to get their position
          const existingParentIds = existingParents.map((rel: any) => rel.fromMemberId);
          const parentMembers = members.filter((m: any) => existingParentIds.includes(m.id));
          
          // Safety check: ensure we have valid parent members
          if (parentMembers.length > 0) {
            // Find rightmost parent
            const rightmostParent = parentMembers.reduce((rightmost, current) => {
              return (current.positionX || 0) > (rightmost.positionX || 0) ? current : rightmost;
            }, parentMembers[0]);
            
            // Position new parent to the right of existing parent
            positionX = (rightmostParent.positionX || 0) + 250;
            positionY = rightmostParent.positionY || (relativeY - 200);
          } else {
            // Fallback to default if parent members not found (data inconsistency)
            positionX = relativeX;
            positionY = relativeY - 200;
          }
        }
        break;
      case 'child':
        // Below the relative member
        positionX = relativeX + Math.floor(Math.random() * 200) - 100; // random(-100, 100)
        positionY = relativeY + 200;
        break;
      case 'spouse':
        // Same level, beside the relative member
        positionX = relativeX + 250;
        positionY = relativeY;
        break;
      case 'sibling':
        // Same level, beside the relative member
        positionX = relativeX + 200;
        positionY = relativeY;
        break;
      case 'adoption':
        // Similar to parent positioning but for adoptive relationships
        if (existingParents.length === 0) {
          positionX = relativeX;
          positionY = relativeY - 200;
        } else {
          const existingParentIds = existingParents.map((rel: any) => rel.fromMemberId);
          const parentMembers = members.filter((m: any) => existingParentIds.includes(m.id));
          if (parentMembers.length > 0) {
            const rightmostParent = parentMembers.reduce((rightmost, current) => {
              return (current.positionX || 0) > (rightmost.positionX || 0) ? current : rightmost;
            }, parentMembers[0]);
            positionX = (rightmostParent.positionX || 0) + 250;
            positionY = rightmostParent.positionY || (relativeY - 200);
          } else {
            positionX = relativeX;
            positionY = relativeY - 200;
          }
        }
        break;
      case 'stepParent':
        // Similar to parent/adoption positioning with offset logic
        if (existingParents.length === 0) {
          positionX = relativeX;
          positionY = relativeY - 200;
        } else {
          const existingParentIds = existingParents.map((rel: any) => rel.fromMemberId);
          const parentMembers = members.filter((m: any) => existingParentIds.includes(m.id));
          if (parentMembers.length > 0) {
            const rightmostParent = parentMembers.reduce((rightmost, current) => {
              return (current.positionX || 0) > (rightmost.positionX || 0) ? current : rightmost;
            }, parentMembers[0]);
            positionX = (rightmostParent.positionX || 0) + 250;
            positionY = rightmostParent.positionY || (relativeY - 200);
          } else {
            positionX = relativeX;
            positionY = relativeY - 200;
          }
        }
        break;
      case 'grandparent':
        // Above parent level
        positionX = relativeX;
        positionY = relativeY - 350;
        break;
      case 'cousin':
        // Same level, offset
        positionX = relativeX + 250;
        positionY = relativeY;
        break;
      default:
        positionX = 0;
        positionY = 0;
    }
    
    // Check if this character already exists in the tree (to prevent duplicates)
    let savedMember;
    if (characterId) {
      const existingMember = members.find((m: any) => m.characterId === characterId);
      if (existingMember) {
        // Reuse the existing member instead of creating a duplicate
        savedMember = existingMember;
      }
    }
    
    // Create a new member only if one doesn't already exist
    if (!savedMember) {
      const memberData = {
        treeId,
        characterId: characterId || null,
        inlineName: inlineName || null,
        positionX,
        positionY
      };
      
      const validatedMember = insertFamilyTreeMemberSchema.parse(memberData);
      savedMember = await storage.createFamilyTreeMember(validatedMember);
    }
    
    // Create the relationship based on relationship type mapping
    let relationshipData: any;
    
    switch (relationshipType) {
      case 'parent':
        // parent → create "parent" relationship FROM new member TO relative
        relationshipData = {
          treeId,
          fromMemberId: savedMember.id,
          toMemberId: relativeMemberId,
          relationshipType: 'parent'
        };
        break;
      case 'child':
        // child → create "parent" relationship FROM relative TO new member
        relationshipData = {
          treeId,
          fromMemberId: relativeMemberId,
          toMemberId: savedMember.id,
          relationshipType: 'parent'
        };
        break;
      case 'spouse':
        // spouse → create "marriage" relationship between them
        relationshipData = {
          treeId,
          fromMemberId: relativeMemberId,
          toMemberId: savedMember.id,
          relationshipType: 'marriage'
        };
        break;
      case 'sibling':
        // sibling → create "sibling" relationship between them
        relationshipData = {
          treeId,
          fromMemberId: relativeMemberId,
          toMemberId: savedMember.id,
          relationshipType: 'sibling'
        };
        break;
      case 'adoption':
        // adoption → create "adoption" relationship FROM new member TO relative
        relationshipData = {
          treeId,
          fromMemberId: savedMember.id,
          toMemberId: relativeMemberId,
          relationshipType: 'adoption'
        };
        break;
      case 'stepParent':
        // stepParent → create "stepParent" relationship FROM new member TO relative
        relationshipData = {
          treeId,
          fromMemberId: savedMember.id,
          toMemberId: relativeMemberId,
          relationshipType: 'stepParent'
        };
        break;
      case 'grandparent':
        // grandparent → create "grandparent" relationship FROM new member TO relative
        relationshipData = {
          treeId,
          fromMemberId: savedMember.id,
          toMemberId: relativeMemberId,
          relationshipType: 'grandparent'
        };
        break;
      case 'cousin':
        // cousin → create "cousin" relationship between them
        relationshipData = {
          treeId,
          fromMemberId: relativeMemberId,
          toMemberId: savedMember.id,
          relationshipType: 'cousin'
        };
        break;
    }
    
    const validatedRelationship = insertFamilyTreeRelationshipSchema.parse(relationshipData);
    const savedRelationship = await storage.createFamilyTreeRelationship(validatedRelationship);
    
    // Create marriage only when adding exactly the second parent AND no marriage exists yet
    if (relationshipType === 'parent' && existingParents.length === 1) {
      const firstParentId = existingParents[0].fromMemberId;
      
      // Re-fetch relationships to get the most current state (including the just-created parent relationship)
      const freshRelationships = await storage.getFamilyTreeRelationships(treeId, userId);
      
      // Check if marriage already exists between the two parents
      const existingMarriage = freshRelationships.find((rel: any) =>
        rel.relationshipType === 'marriage' &&
        ((rel.fromMemberId === firstParentId && rel.toMemberId === savedMember.id) ||
         (rel.fromMemberId === savedMember.id && rel.toMemberId === firstParentId))
      );
      
      if (!existingMarriage) {
        const marriageData = {
          treeId,
          fromMemberId: firstParentId,
          toMemberId: savedMember.id,
          relationshipType: 'marriage'
        };
        const validatedMarriage = insertFamilyTreeRelationshipSchema.parse(marriageData);
        
        try {
          await storage.createFamilyTreeRelationship(validatedMarriage);
        } catch (error) {
          // Ignore duplicate relationship errors (race condition handled)
          if (error instanceof Error && !error.message.includes('already exists')) {
            throw error;
          }
        }
      }
    }
    
    // Return both the created member and relationship
    res.json({
      member: savedMember,
      relationship: savedRelationship
    });
  } catch (error) {
    console.error('Error creating related family tree member:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      console.warn(`[Security] Unauthorized operation - userId: ${req.user?.claims?.sub}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: 'Failed to create related family tree member' });
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
