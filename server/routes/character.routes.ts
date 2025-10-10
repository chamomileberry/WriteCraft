import { Router } from "express";
import { storage } from "../storage";
import { insertCharacterSchema, updateCharacterSchema } from "@shared/schema";
import { z } from "zod";
import { generateCharacterWithAI, generateCharacterFieldWithAI } from "../ai-generation";
import { generateArticleForContent } from "../article-generation";
import { validateInput } from "../security/middleware";

const router = Router();

// Character generator routes
router.post("/generate", async (req: any, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client payload)
    const userId = req.user.claims.sub;
    
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      gender: z.string().optional(),
      ethnicity: z.string().optional(),
      notebookId: z.string()
    });
    
    const { genre, gender, ethnicity, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate user owns the notebook before creating content
    const userNotebook = await storage.getNotebook(notebookId, userId);
    if (!userNotebook) {
      console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    // Use AI generation instead of archetype system
    const aiCharacter = await generateCharacterWithAI({ genre, gender, ethnicity });
    
    const character = {
      // Basic demographics and identity
      age: aiCharacter.age,
      sex: aiCharacter.sex,
      gender: aiCharacter.gender,
      genderIdentity: aiCharacter.genderIdentity,
      pronouns: aiCharacter.pronouns,
      ethnicity: aiCharacter.ethnicity,
      species: aiCharacter.species,
      genre: genre || null,
      // Names
      givenName: aiCharacter.givenName,
      familyName: aiCharacter.familyName,
      middleName: aiCharacter.middleName || null,
      nickname: aiCharacter.nickname || null,
      // Location and origin
      placeOfBirth: aiCharacter.placeOfBirth,
      currentLocation: aiCharacter.currentLocation,
      currentResidence: aiCharacter.currentResidence,
      // Physical description
      height: aiCharacter.height,
      heightDetail: aiCharacter.heightDetail,
      weight: aiCharacter.weight,
      build: aiCharacter.build,
      hairColor: aiCharacter.hairColor,
      hairTexture: aiCharacter.hairTexture,
      hairStyle: aiCharacter.hairStyle,
      eyeColor: aiCharacter.eyeColor,
      skinTone: aiCharacter.skinTone,
      facialFeatures: aiCharacter.facialFeatures,
      facialDetails: aiCharacter.facialDetails,
      strikingFeatures: aiCharacter.strikingFeatures,
      distinctiveBodyFeatures: aiCharacter.distinctiveBodyFeatures,
      marksPiercingsTattoos: aiCharacter.marksPiercingsTattoos,
      identifyingMarks: aiCharacter.identifyingMarks,
      physicalDescription: aiCharacter.physicalDescription,
      physicalPresentation: aiCharacter.physicalPresentation,
      physicalCondition: aiCharacter.physicalCondition,
      // Professional and background
      occupation: aiCharacter.occupation,
      profession: aiCharacter.profession,
      education: aiCharacter.education,
      workHistory: aiCharacter.workHistory,
      accomplishments: aiCharacter.accomplishments,
      // Personality and psychology
      personality: aiCharacter.personality,
      backstory: aiCharacter.backstory,
      upbringing: aiCharacter.upbringing,
      motivation: aiCharacter.motivation,
      flaw: aiCharacter.flaw,
      strength: aiCharacter.strength,
      characterFlaws: aiCharacter.characterFlaws,
      intellectualTraits: aiCharacter.intellectualTraits,
      valuesEthicsMorals: aiCharacter.valuesEthicsMorals,
      mentalHealth: aiCharacter.mentalHealth,
      negativeEvents: aiCharacter.negativeEvents,
      // Skills and abilities
      languages: aiCharacter.languages,
      languageFluencyAccent: aiCharacter.languageFluencyAccent,
      mainSkills: aiCharacter.mainSkills,
      strengths: aiCharacter.strengths,
      positiveAspects: aiCharacter.positiveAspects,
      proficiencies: aiCharacter.proficiencies,
      lackingSkills: aiCharacter.lackingSkills,
      lackingKnowledge: aiCharacter.lackingKnowledge,
      // Personal preferences
      likes: aiCharacter.likes,
      dislikes: aiCharacter.dislikes,
      addictions: aiCharacter.addictions,
      vices: aiCharacter.vices,
      secretBeliefs: aiCharacter.secretBeliefs,
      // Style and possessions
      typicalAttire: aiCharacter.typicalAttire,
      accessories: aiCharacter.accessories,
      // Cultural and social
      sexualOrientation: aiCharacter.sexualOrientation,
      religiousBelief: aiCharacter.religiousBelief,
      family: aiCharacter.family,
      // Additional character details
      conditions: aiCharacter.conditions,
      genderUnderstanding: aiCharacter.genderUnderstanding,
      frownedUponViews: aiCharacter.frownedUponViews,
      userId,
      notebookId
    };

    // Validate the generated character data before saving
    const validatedCharacter = insertCharacterSchema.parse(character);
    const savedCharacter = await storage.createCharacter(validatedCharacter);
    res.json(savedCharacter);
  } catch (error) {
    console.error('Error generating character:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      console.warn(`[Security] Unauthorized error in character generation - userId: ${userId}`);
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

// Character field generation route
router.post("/:id/generate-field", async (req: any, res) => {
  try {
    // Valid field names for character generation
    const validFieldNames = [
      'backstory', 'motivation', 'flaw', 'strength', 'personality', 'occupation',
      'physicalDescription', 'habits', 'fears', 'goals', 'relationships', 'speech',
      'secrets', 'beliefs', 'hobbies', 'quirks', 'mannerisms', 'upbringing',
      'negativeEvents', 'mentalHealth', 'intellectualTraits', 'physicalCondition',
      'supernaturalPowers', 'mainSkills', 'lackingSkills', 'typicalAttire',
      'keyEquipment', 'characterFlaws', 'likes', 'dislikes', 'behavioralTraits',
      'charisma', 'habitualGestures', 'keyRelationships', 'allies', 'enemies',
      'overseeingDomain', 'legacy', 'wealthClass', 'hygieneValue', 'famousQuotes',
      'speechParticularities', 'religiousViews', 'spiritualPractices',
      'strikingFeatures', 'marksPiercingsTattoos'
    ];

    const generateFieldSchema = z.object({
      fieldName: z.string().refine(name => validFieldNames.includes(name), {
        message: `Field name must be one of: ${validFieldNames.join(', ')}`
      }),
      currentFormData: z.record(z.any()).optional(),
      notebookId: z.string()
    });
    
    // Extract userId from authentication headers for security
    const userId = req.user.claims.sub;
    const { fieldName, currentFormData, notebookId } = generateFieldSchema.parse(req.body);
    
    // Validate user owns the notebook before generating content
    const userNotebook = await storage.getNotebook(notebookId, userId);
    if (!userNotebook) {
      console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    // Get the existing character data for context
    const existingCharacter = await storage.getCharacter(req.params.id, userId, notebookId);
    if (!existingCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Merge current form data with stored character for fresh context
    const contextCharacter = currentFormData ? 
      { ...existingCharacter, ...currentFormData } : 
      existingCharacter;
    
    // Generate field content using AI with merged character context
    const generatedContent = await generateCharacterFieldWithAI(fieldName, contextCharacter);
    
    res.json({ content: generatedContent });
  } catch (error) {
    console.error('Error generating character field:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Create character manually (from comprehensive form)
router.post("/", validateInput(insertCharacterSchema.omit({ userId: true })), async (req: any, res) => {
  try {
    // Extract userId from header for security (override client payload)
    const userId = req.user.claims.sub;
    const { notebookId, ...characterData } = req.body;
    
    // Validate notebookId is provided
    if (!notebookId) {
      return res.status(400).json({ error: 'Notebook ID is required' });
    }
    
    // Validate user owns the notebook before creating content
    const userNotebook = await storage.getNotebook(notebookId, userId);
    if (!userNotebook) {
      console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    const fullCharacterData = { ...characterData, userId, notebookId };
    const savedCharacter = await storage.createCharacter(fullCharacterData);
    res.json(savedCharacter);
  } catch (error) {
    console.error('Error creating character:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
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
    
    const characters = await storage.getUserCharacters(userId, notebookId);
    
    if (search) {
      // Filter characters by name fields (case-insensitive)
      const filtered = characters.filter(character => {
        const searchTerm = search.toLowerCase();
        return (
          character.givenName?.toLowerCase().includes(searchTerm) ||
          character.familyName?.toLowerCase().includes(searchTerm) ||
          character.nickname?.toLowerCase().includes(searchTerm) ||
          character.honorificTitle?.toLowerCase().includes(searchTerm)
        );
      });
      res.json(filtered);
    } else {
      res.json(characters);
    }
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

router.get("/user/:userId?", async (req: any, res) => {
  try {
    // Extract userId from authentication headers for security (ignore client-supplied userId)
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const characters = await storage.getUserCharacters(userId, notebookId);
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const notebookId = req.query.notebookId as string;
    const userId = req.user.claims.sub;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const character = await storage.getCharacter(req.params.id, userId, notebookId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ error: 'Failed to fetch character' });
  }
});

router.patch("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Validate the request body against the update schema
    const validatedUpdates = updateCharacterSchema.parse(req.body);
    
    // Ensure userId is preserved and not overwritten
    const updatesWithUserId = { ...validatedUpdates, userId };
    
    const updatedCharacter = await storage.updateCharacter(req.params.id, userId, updatesWithUserId, notebookId);
    
    // Update saved_items itemData so notebook view shows fresh data immediately
    try {
      await storage.updateSavedItemDataByItem(userId, 'character', req.params.id, notebookId, updatedCharacter);
    } catch (error) {
      console.warn('Failed to update saved item data after character update:', error);
      // Don't fail the request if this update fails
    }
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized character update attempt - userId: ${userId}, characterId: ${req.params.id}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Character not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

// Delete character
router.delete("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    await storage.deleteCharacter(req.params.id, userId, notebookId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting character:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && (error.message.includes('Unauthorized') || error.message.includes('not found'))) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized character deletion attempt - userId: ${userId}, characterId: ${req.params.id}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Character not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

// Generate article from structured character data
router.post("/:id/generate-article", async (req: any, res) => {
  try {
    const notebookId = req.query.notebookId as string;
    const userId = req.user.claims.sub;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    // Use centralized secure article generation service
    const updatedCharacter = await generateArticleForContent(
      'characters',
      req.params.id,
      userId,
      notebookId
    );
    
    res.json(updatedCharacter);
  } catch (error) {
    console.error('Error generating character article:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      const userId = req.user?.claims?.sub || 'unknown';
      const notebookId = req.query.notebookId || 'unknown';
      console.warn(`[Security] Unauthorized article generation attempt - userId: ${userId}, characterId: ${req.params.id}, notebookId: ${notebookId}`);
      return res.status(404).json({ error: 'Character not found' });
    }
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
