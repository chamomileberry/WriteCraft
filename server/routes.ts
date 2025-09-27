import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
  insertManuscriptSchema,
  insertManuscriptLinkSchema,
  insertFolderSchema,
  insertNoteSchema
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
  improveText
} from "./ai-generation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Character generator routes
  app.post("/api/characters/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        genre: z.string().optional(),
        gender: z.string().optional(),
        ethnicity: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { genre, gender, ethnicity, userId } = generateRequestSchema.parse(req.body);
      
      // Use AI generation instead of archetype system
      const aiCharacter = await generateCharacterWithAI({ genre, gender, ethnicity });
      
      const character = {
        name: aiCharacter.name,
        age: aiCharacter.age,
        occupation: aiCharacter.occupation,
        personality: aiCharacter.personality,
        backstory: aiCharacter.backstory,
        motivation: aiCharacter.motivation,
        flaw: aiCharacter.flaw,
        strength: aiCharacter.strength,
        gender: aiCharacter.gender,
        genre: genre || null,
        // Physical description fields
        height: aiCharacter.height,
        build: aiCharacter.build,
        hairColor: aiCharacter.hairColor,
        eyeColor: aiCharacter.eyeColor,
        skinTone: aiCharacter.skinTone,
        facialFeatures: aiCharacter.facialFeatures,
        identifyingMarks: aiCharacter.identifyingMarks,
        physicalDescription: aiCharacter.physicalDescription,
        userId: userId || null
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
      res.status(500).json({ error: errorMessage });
    }
  });

  // Character field generation route
  app.post("/api/characters/:id/generate-field", async (req, res) => {
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
        userId: z.string().nullable().optional()
      });
      
      const { fieldName, currentFormData, userId } = generateFieldSchema.parse(req.body);
      
      // Get the existing character data for context
      const existingCharacter = await storage.getCharacter(req.params.id);
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
  app.post("/api/characters", async (req, res) => {
    try {
      // Extract userId from header for security (override client payload)
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const characterData = { ...req.body, userId };
      
      // Validate the request body using the insert schema
      const validatedCharacter = insertCharacterSchema.parse(characterData);
      const savedCharacter = await storage.createCharacter(validatedCharacter);
      res.json(savedCharacter);
    } catch (error) {
      console.error('Error creating character:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid character data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/characters", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const characters = await storage.getUserCharacters(userId);
      
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

  app.get("/api/characters/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const characters = await storage.getUserCharacters(userId);
      res.json(characters);
    } catch (error) {
      console.error('Error fetching characters:', error);
      res.status(500).json({ error: 'Failed to fetch characters' });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const character = await storage.getCharacter(req.params.id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
      res.json(character);
    } catch (error) {
      console.error('Error fetching character:', error);
      res.status(500).json({ error: 'Failed to fetch character' });
    }
  });

  app.patch("/api/characters/:id", async (req, res) => {
    try {
      // Extract userId from header for security (prevent userId manipulation)
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      
      // Validate the request body against the update schema
      const validatedUpdates = updateCharacterSchema.parse(req.body);
      
      // Ensure userId is preserved and not overwritten
      const updatesWithUserId = { ...validatedUpdates, userId };
      
      const updatedCharacter = await storage.updateCharacter(req.params.id, updatesWithUserId);
      res.json(updatedCharacter);
    } catch (error) {
      console.error('Error updating character:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  // Plot generator routes
  app.post("/api/plots/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        genre: z.string().optional(),
        storyStructure: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { genre, storyStructure, userId } = generateRequestSchema.parse(req.body);
      
      const plot = {
        setup: generateRandomSetup(),
        incitingIncident: "An unexpected event disrupts the protagonist's normal world and sets the story in motion",
        firstPlotPoint: "The protagonist commits to their journey and crosses into a new world or situation",
        midpoint: "A major revelation or setback occurs, raising the stakes and changing the protagonist's approach",
        secondPlotPoint: "All seems lost as the protagonist faces their darkest moment",
        climax: "The final confrontation where the protagonist must use everything they've learned",
        resolution: "The aftermath where loose ends are tied up and the new normal is established",
        theme: generateRandomTheme(),
        conflict: generateRandomConflict(),
        genre: genre || null,
        storyStructure: storyStructure || null,
        userId: userId || null
      };

      // Validate the generated plot data before saving
      const validatedPlot = insertPlotSchema.parse(plot);
      const savedPlot = await storage.createPlot(validatedPlot);
      res.json(savedPlot);
    } catch (error) {
      console.error('Error generating plot:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to generate plot' });
    }
  });

  app.get("/api/plots/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const plots = await storage.getUserPlots(userId);
      res.json(plots);
    } catch (error) {
      console.error('Error fetching plots:', error);
      res.status(500).json({ error: 'Failed to fetch plots' });
    }
  });

  app.get("/api/plots/:id", async (req, res) => {
    try {
      const plot = await storage.getPlot(req.params.id);
      if (!plot) {
        return res.status(404).json({ error: 'Plot not found' });
      }
      res.json(plot);
    } catch (error) {
      console.error('Error fetching plot:', error);
      res.status(500).json({ error: 'Failed to fetch plot' });
    }
  });

  // Writing prompts routes
  app.post("/api/prompts/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        genre: z.string().optional(),
        type: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { genre, type, userId } = generateRequestSchema.parse(req.body);
      
      // Generate prompt using AI instead of hardcoded templates
      const aiGeneratedPrompt = await generatePromptWithAI({ genre, type });
      
      const prompt = {
        text: aiGeneratedPrompt.text,
        genre: genre || getRandomGenre(),
        difficulty: getRandomDifficulty(),
        type: type || getRandomPromptType(),
        wordCount: getRandomWordCount(),
        tags: [genre || 'general', 'creative writing', 'inspiration'],
        userId: userId || null
      };

      // Validate the generated prompt data before saving
      const validatedPrompt = insertPromptSchema.parse(prompt);
      const savedPrompt = await storage.createPrompt(validatedPrompt);
      res.json(savedPrompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to generate prompt' });
    }
  });

  app.get("/api/prompts/random", async (req, res) => {
    try {
      const count = parseInt(req.query.count as string) || 5;
      const genre = req.query.genre as string;
      const prompts = await storage.getRandomPrompts(count);
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching random prompts:', error);
      res.status(500).json({ error: 'Failed to fetch prompts' });
    }
  });

  app.get("/api/prompts/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const prompts = await storage.getUserPrompts(userId);
      res.json(prompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      res.status(500).json({ error: 'Failed to fetch prompts' });
    }
  });

  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const prompt = await storage.getPrompt(req.params.id);
      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }
      res.json(prompt);
    } catch (error) {
      console.error('Error fetching prompt:', error);
      res.status(500).json({ error: 'Failed to fetch prompt' });
    }
  });

  // Writing guides routes
  app.get("/api/guides", async (req, res) => {
    try {
      const { query, category, difficulty } = req.query;
      let guides;
      
      if (query || category || difficulty) {
        guides = await storage.searchGuides(
          query as string || '',
          category as string
        );
      } else {
        guides = await storage.getGuides();
      }
      
      res.json(guides);
    } catch (error) {
      console.error('Error fetching guides:', error);
      res.status(500).json({ error: 'Failed to fetch guides' });
    }
  });

  app.get("/api/guides/:id", async (req, res) => {
    try {
      const guide = await storage.getGuide(req.params.id);
      if (!guide) {
        return res.status(404).json({ error: 'Guide not found' });
      }
      res.json(guide);
    } catch (error) {
      console.error('Error fetching guide:', error);
      res.status(500).json({ error: 'Failed to fetch guide' });
    }
  });

  app.post("/api/guides", async (req, res) => {
    try {
      const guideData = insertGuideSchema.parse(req.body);
      const newGuide = await storage.createGuide(guideData);
      res.status(201).json(newGuide);
    } catch (error) {
      console.error('Error creating guide:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid guide data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create guide' });
    }
  });

  app.put("/api/guides/:id", async (req, res) => {
    try {
      const updateData = insertGuideSchema.partial().parse(req.body);
      const updatedGuide = await storage.updateGuide(req.params.id, updateData);
      
      if (!updatedGuide) {
        return res.status(404).json({ error: 'Guide not found' });
      }
      
      res.json(updatedGuide);
    } catch (error) {
      console.error('Error updating guide:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid guide data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update guide' });
    }
  });

  app.delete("/api/guides/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGuide(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Guide not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting guide:', error);
      res.status(500).json({ error: 'Failed to delete guide' });
    }
  });

  // Setting generator routes
  app.post("/api/settings/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        genre: z.string().optional(),
        settingType: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { genre, settingType, userId } = generateRequestSchema.parse(req.body);
      
      // Use AI generation instead of random generation
      const aiSetting = await generateSettingWithAI({ genre, settingType });
      
      const setting = {
        name: aiSetting.name,
        location: aiSetting.location,
        timePeriod: aiSetting.timePeriod,
        population: aiSetting.population,
        climate: aiSetting.climate,
        description: aiSetting.description,
        atmosphere: aiSetting.atmosphere,
        culturalElements: aiSetting.culturalElements,
        notableFeatures: aiSetting.notableFeatures,
        genre: genre || null,
        settingType: settingType || null,
        userId: userId || null
      };

      // Validate the generated setting data before saving
      const validatedSetting = insertSettingSchema.parse(setting);
      const savedSetting = await storage.createSetting(validatedSetting);
      res.json(savedSetting);
    } catch (error) {
      console.error('Error generating setting:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedSetting = insertSettingSchema.parse(req.body);
      const savedSetting = await storage.createSetting(validatedSetting);
      res.json(savedSetting);
    } catch (error) {
      console.error('Error saving setting:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save setting' });
    }
  });

  app.get("/api/settings/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const settings = await storage.getUserSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.get("/api/settings/:id", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.id);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      res.json(setting);
    } catch (error) {
      console.error('Error fetching setting:', error);
      res.status(500).json({ error: 'Failed to fetch setting' });
    }
  });

  // Creature generator routes
  app.post("/api/creatures/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        genre: z.string().optional(),
        creatureType: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { genre, creatureType, userId } = generateRequestSchema.parse(req.body);
      
      // Use AI generation
      const aiCreature = await generateCreatureWithAI({ genre, creatureType });
      
      const creature = {
        name: aiCreature.name,
        creatureType: aiCreature.creatureType,
        habitat: aiCreature.habitat,
        physicalDescription: aiCreature.physicalDescription,
        abilities: aiCreature.abilities,
        behavior: aiCreature.behavior,
        culturalSignificance: aiCreature.culturalSignificance,
        genre: genre || null,
        userId: userId || null
      };

      // Validate the generated creature data before saving
      const validatedCreature = insertCreatureSchema.parse(creature);
      const savedCreature = await storage.createCreature(validatedCreature);
      res.json(savedCreature);
    } catch (error) {
      console.error('Error generating creature:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/creatures/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const creatures = await storage.getUserCreatures(userId);
      res.json(creatures);
    } catch (error) {
      console.error('Error fetching creatures:', error);
      res.status(500).json({ error: 'Failed to fetch creatures' });
    }
  });

  app.get("/api/creatures/:id", async (req, res) => {
    try {
      const creature = await storage.getCreature(req.params.id);
      if (!creature) {
        return res.status(404).json({ error: 'Creature not found' });
      }
      res.json(creature);
    } catch (error) {
      console.error('Error fetching creature:', error);
      res.status(500).json({ error: 'Failed to fetch creature' });
    }
  });

  app.patch("/api/creatures/:id", async (req, res) => {
    try {
      const updates = insertCreatureSchema.partial().parse(req.body);
      const updatedCreature = await storage.updateCreature(req.params.id, updates);
      res.json(updatedCreature);
    } catch (error) {
      console.error('Error updating creature:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update creature' });
    }
  });

  // Name generator routes
  app.post("/api/names/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        nameType: z.string(),
        culture: z.string(),
        userId: z.string().nullable().optional()
      });
      
      const { nameType, culture, userId } = generateRequestSchema.parse(req.body);
      
      const generatedNames = generateRandomNames(nameType, culture, userId || null);
      const namesList = generatedNames.map(name => ({
        ...name,
        userId: userId || null
      }));

      // Create individual names using createName
      const savedNames = [];
      for (const name of namesList) {
        const validatedName = insertNameSchema.parse(name);
        const savedName = await storage.createName(validatedName);
        savedNames.push(savedName);
      }
      
      res.json(savedNames);
    } catch (error) {
      console.error('Error generating names:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to generate names' });
    }
  });

  app.post("/api/names", async (req, res) => {
    try {
      const { names } = req.body;
      const savedNames = [];
      for (const name of names) {
        const validatedName = insertNameSchema.parse(name);
        const savedName = await storage.createName(validatedName);
        savedNames.push(savedName);
      }
      res.json(savedNames);
    } catch (error) {
      console.error('Error saving names:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save names' });
    }
  });

  app.get("/api/names/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const names = await storage.getUserNames(userId);
      res.json(names);
    } catch (error) {
      console.error('Error fetching names:', error);
      res.status(500).json({ error: 'Failed to fetch names' });
    }
  });

  app.get("/api/names/:id", async (req, res) => {
    try {
      const name = await storage.getName(req.params.id);
      if (!name) {
        return res.status(404).json({ error: 'Name not found' });
      }
      res.json(name);
    } catch (error) {
      console.error('Error fetching name:', error);
      res.status(500).json({ error: 'Failed to fetch name' });
    }
  });

  // Conflict generator routes
  app.post("/api/conflicts/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        conflictType: z.string().optional(),
        genre: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { conflictType, genre, userId } = generateRequestSchema.parse(req.body);
      
      const conflict = {
        title: generateRandomConflictTitle(),
        type: conflictType === 'any' ? generateRandomConflictType() : (conflictType || generateRandomConflictType()),
        description: generateRandomConflictDescription(),
        stakes: generateRandomStakes(),
        obstacles: generateRandomObstacles(),
        potentialResolutions: generateRandomResolutions(),
        emotionalImpact: generateRandomEmotionalImpact(),
        genre: genre === 'any' ? null : genre,
        userId: userId || null
      };

      const validatedConflict = insertConflictSchema.parse(conflict);
      const savedConflict = await storage.createConflict(validatedConflict);
      res.json(savedConflict);
    } catch (error) {
      console.error('Error generating conflict:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to generate conflict' });
    }
  });

  app.post("/api/conflicts", async (req, res) => {
    try {
      const validatedConflict = insertConflictSchema.parse(req.body);
      const savedConflict = await storage.createConflict(validatedConflict);
      res.json(savedConflict);
    } catch (error) {
      console.error('Error saving conflict:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save conflict' });
    }
  });

  app.get("/api/conflicts/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const conflicts = await storage.getUserConflicts(userId);
      res.json(conflicts);
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      res.status(500).json({ error: 'Failed to fetch conflicts' });
    }
  });

  app.get("/api/conflicts/:id", async (req, res) => {
    try {
      const conflict = await storage.getConflict(req.params.id);
      if (!conflict) {
        return res.status(404).json({ error: 'Conflict not found' });
      }
      res.json(conflict);
    } catch (error) {
      console.error('Error fetching conflict:', error);
      res.status(500).json({ error: 'Failed to fetch conflict' });
    }
  });

  // Theme generator routes
  app.post("/api/themes/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        genre: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { genre, userId } = generateRequestSchema.parse(req.body);
      
      const theme = {
        title: generateRandomThemeTitle(),
        description: generateRandomThemeDescription(),
        coreMessage: generateRandomCoreMessage(),
        symbolicElements: generateRandomSymbolicElements(),
        questions: generateRandomThematicQuestions(),
        conflicts: generateRandomThematicConflicts(),
        examples: generateRandomLiteraryExamples(),
        genre: genre === 'any' ? null : genre,
        userId: userId || null
      };

      const validatedTheme = insertThemeSchema.parse(theme);
      const savedTheme = await storage.createTheme(validatedTheme);
      res.json(savedTheme);
    } catch (error) {
      console.error('Error generating theme:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to generate theme' });
    }
  });

  app.post("/api/themes", async (req, res) => {
    try {
      const validatedTheme = insertThemeSchema.parse(req.body);
      const savedTheme = await storage.createTheme(validatedTheme);
      res.json(savedTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save theme' });
    }
  });

  app.get("/api/themes/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const themes = await storage.getUserThemes(userId);
      res.json(themes);
    } catch (error) {
      console.error('Error fetching themes:', error);
      res.status(500).json({ error: 'Failed to fetch themes' });
    }
  });

  app.get("/api/themes/:id", async (req, res) => {
    try {
      const theme = await storage.getTheme(req.params.id);
      if (!theme) {
        return res.status(404).json({ error: 'Theme not found' });
      }
      res.json(theme);
    } catch (error) {
      console.error('Error fetching theme:', error);
      res.status(500).json({ error: 'Failed to fetch theme' });
    }
  });

  // Mood generator routes
  app.post("/api/moods/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        userId: z.string().nullable().optional()
      });
      
      const { userId } = generateRequestSchema.parse(req.body);
      
      const mood = {
        name: generateRandomMoodName(),
        description: generateRandomMoodDescription(),
        emotionalTone: generateRandomEmotionalTone(),
        sensoryDetails: generateRandomSensoryDetails(),
        colorAssociations: generateRandomColorAssociations(),
        weatherElements: generateRandomWeatherElements(),
        lightingEffects: generateRandomLightingEffects(),
        soundscape: generateRandomSoundscape(),
        userId: userId || null
      };

      const validatedMood = insertMoodSchema.parse(mood);
      const savedMood = await storage.createMood(validatedMood);
      res.json(savedMood);
    } catch (error) {
      console.error('Error generating mood:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to generate mood' });
    }
  });

  app.post("/api/moods", async (req, res) => {
    try {
      const validatedMood = insertMoodSchema.parse(req.body);
      const savedMood = await storage.createMood(validatedMood);
      res.json(savedMood);
    } catch (error) {
      console.error('Error saving mood:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save mood' });
    }
  });

  app.get("/api/moods/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const moods = await storage.getUserMoods(userId);
      res.json(moods);
    } catch (error) {
      console.error('Error fetching moods:', error);
      res.status(500).json({ error: 'Failed to fetch moods' });
    }
  });

  app.get("/api/moods/:id", async (req, res) => {
    try {
      const mood = await storage.getMood(req.params.id);
      if (!mood) {
        return res.status(404).json({ error: 'Mood not found' });
      }
      res.json(mood);
    } catch (error) {
      console.error('Error fetching mood:', error);
      res.status(500).json({ error: 'Failed to fetch mood' });
    }
  });

  // Saved items routes
  app.post("/api/saved-items", async (req, res) => {
    try {
      console.log('Received save request body:', JSON.stringify(req.body, null, 2));
      const validatedData = insertSavedItemSchema.parse(req.body);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
      const savedItem = await storage.saveItem(validatedData);
      console.log('Saved item result:', JSON.stringify(savedItem, null, 2));
      res.json(savedItem);
    } catch (error) {
      console.error('Error saving item:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save item' });
    }
  });

  app.delete("/api/saved-items", async (req, res) => {
    try {
      const deleteRequestSchema = z.object({
        userId: z.string(),
        itemType: z.string(),
        itemId: z.string()
      });
      
      const { userId, itemType, itemId } = deleteRequestSchema.parse(req.body);
      await storage.unsaveItem(userId, itemType, itemId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error unsaving item:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to unsave item' });
    }
  });

  app.get("/api/saved-items/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { itemType } = req.query;
      const savedItems = await storage.getUserSavedItems(userId, itemType as string);
      res.json(savedItems);
    } catch (error) {
      console.error('Error fetching saved items:', error);
      res.status(500).json({ error: 'Failed to fetch saved items' });
    }
  });

  // Manuscript routes
  app.get("/api/manuscripts", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const manuscripts = await storage.getUserManuscripts(userId);
      res.json(manuscripts);
    } catch (error) {
      console.error('Error fetching manuscripts:', error);
      res.status(500).json({ error: 'Failed to fetch manuscripts' });
    }
  });

  app.post("/api/manuscripts", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const manuscriptData = { ...req.body, userId };
      
      const validatedManuscript = insertManuscriptSchema.parse(manuscriptData);
      const savedManuscript = await storage.createManuscript(validatedManuscript);
      res.json(savedManuscript);
    } catch (error) {
      console.error('Error creating manuscript:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create manuscript' });
    }
  });

  app.get("/api/manuscripts/search", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const query = req.query.q as string || '';
      
      const searchResults = await storage.searchManuscripts(userId, query);
      res.json(searchResults);
    } catch (error) {
      console.error('Error searching manuscripts:', error);
      res.status(500).json({ error: 'Failed to search manuscripts' });
    }
  });

  app.get("/api/manuscripts/:id", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const manuscript = await storage.getManuscript(req.params.id, userId);
      
      if (!manuscript) {
        return res.status(404).json({ error: 'Manuscript not found' });
      }
      res.json(manuscript);
    } catch (error) {
      console.error('Error fetching manuscript:', error);
      res.status(500).json({ error: 'Failed to fetch manuscript' });
    }
  });

  app.put("/api/manuscripts/:id", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const manuscriptData = { ...req.body, userId };
      
      const validatedUpdates = insertManuscriptSchema.partial().parse(manuscriptData);
      const updatedManuscript = await storage.updateManuscript(req.params.id, userId, validatedUpdates);
      res.json(updatedManuscript);
    } catch (error) {
      console.error('Error updating manuscript:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update manuscript' });
    }
  });

  app.delete("/api/manuscripts/:id", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      await storage.deleteManuscript(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting manuscript:', error);
      res.status(500).json({ error: 'Failed to delete manuscript' });
    }
  });

  // Universal search endpoint
  app.get("/api/search", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const query = req.query.q as string || '';
      
      const searchResults = await storage.searchAllContent(userId, query);
      res.json(searchResults);
    } catch (error) {
      console.error('Error searching content:', error);
      res.status(500).json({ error: 'Failed to search content' });
    }
  });

  // Pinned content endpoints
  app.get("/api/pinned-content", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const category = req.query.category as string;
      
      const pinnedItems = await storage.getUserPinnedContent(userId, category);
      
      // Enhance pinned items with actual content data
      const enhancedItems = await Promise.all(pinnedItems.map(async (pin) => {
        let title = 'Unknown';
        let subtitle = '';
        
        try {
          // Fetch the actual content based on type
          switch (pin.targetType) {
            case 'character':
              const character = await storage.getCharacter(pin.targetId);
              if (character) {
                // Try multiple name fields before defaulting to "Untitled Character"
                title = [character.givenName, character.familyName].filter(Boolean).join(' ').trim() ||
                        character.nickname ||
                        character.honorificTitle ||
                        'Untitled Character';
                subtitle = character.occupation || '';
              }
              break;
            case 'location':
              const location = await storage.getLocation(pin.targetId);
              if (location) {
                title = location.name;
                subtitle = location.locationType || '';
              }
              break;
            case 'organization':
              const organization = await storage.getOrganization(pin.targetId);
              if (organization) {
                title = organization.name;
                subtitle = organization.organizationType || '';
              }
              break;
            case 'manuscript':
              const manuscript = await storage.getManuscript(pin.targetId, userId);
              if (manuscript) {
                title = manuscript.title;
                subtitle = manuscript.status || '';
              }
              break;
          }
        } catch (error) {
          console.error(`Error fetching ${pin.targetType} data:`, error);
        }
        
        return {
          ...pin,
          title,
          subtitle
        };
      }));
      
      res.json(enhancedItems);
    } catch (error) {
      console.error('Error fetching pinned content:', error);
      res.status(500).json({ error: 'Failed to fetch pinned content' });
    }
  });

  app.post("/api/pinned-content", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const pinData = { ...req.body, userId };
      
      const pinnedItem = await storage.pinContent(pinData);
      res.json(pinnedItem);
    } catch (error) {
      console.error('Error pinning content:', error);
      res.status(500).json({ error: 'Failed to pin content' });
    }
  });

  app.delete("/api/pinned-content/:id", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const pinnedId = req.params.id;
      
      // Find the pinned item first to get its details
      const pinnedItems = await storage.getUserPinnedContent(userId);
      const pinnedItem = pinnedItems.find(item => item.id === pinnedId);
      
      if (!pinnedItem) {
        return res.status(404).json({ error: 'Pinned item not found' });
      }
      
      await storage.unpinContent(userId, pinnedItem.targetType, pinnedItem.targetId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error unpinning content:', error);
      res.status(500).json({ error: 'Failed to unpin content' });
    }
  });

  // Manuscript Links endpoints
  app.get("/api/manuscripts/:id/links", async (req, res) => {
    try {
      const manuscriptId = req.params.id;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      
      const links = await storage.getManuscriptLinks(manuscriptId, userId);
      res.json(links);
    } catch (error) {
      console.error('Error fetching manuscript links:', error);
      res.status(500).json({ error: 'Failed to fetch manuscript links' });
    }
  });

  app.post("/api/manuscripts/:id/links", async (req, res) => {
    try {
      const manuscriptId = req.params.id;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      
      // Validate the request body
      const validatedData = insertManuscriptLinkSchema.parse({
        ...req.body,
        sourceId: manuscriptId,
        userId
      });
      
      const newLink = await storage.createManuscriptLink(validatedData);
      res.json(newLink);
    } catch (error) {
      console.error('Error creating manuscript link:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid link data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create manuscript link' });
    }
  });

  app.delete("/api/manuscript-links/:id", async (req, res) => {
    try {
      const linkId = req.params.id;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      
      await storage.deleteManuscriptLink(linkId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting manuscript link:', error);
      res.status(500).json({ error: 'Failed to delete manuscript link' });
    }
  });

  // Location routes
  app.post("/api/locations", async (req, res) => {
    try {
      // Extract userId from header for security (override client payload)
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const locationData = { ...req.body, userId };
      
      const validatedLocation = insertLocationSchema.parse(locationData);
      const savedLocation = await storage.createLocation(validatedLocation);
      res.json(savedLocation);
    } catch (error) {
      console.error('Error saving location:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save location' });
    }
  });

  app.get("/api/locations", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const locations = await storage.getUserLocations(userId);
      
      if (search) {
        // Filter locations by name (case-insensitive)
        const filtered = locations.filter(location =>
          location.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });

  app.get("/api/locations/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const locations = await storage.getUserLocations(userId);
      res.json(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const location = await storage.getLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
      res.json(location);
    } catch (error) {
      console.error('Error fetching location:', error);
      res.status(500).json({ error: 'Failed to fetch location' });
    }
  });

  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const updates = insertLocationSchema.partial().parse(req.body);
      const updatedLocation = await storage.updateLocation(req.params.id, updates);
      res.json(updatedLocation);
    } catch (error) {
      console.error('Error updating location:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update location' });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      await storage.deleteLocation(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting location:', error);
      res.status(500).json({ error: 'Failed to delete location' });
    }
  });

  // Species routes
  app.post("/api/species", async (req, res) => {
    try {
      // Extract userId from header for security (override client payload)
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const speciesData = { ...req.body, userId };
      
      const validatedSpecies = insertSpeciesSchema.parse(speciesData);
      const savedSpecies = await storage.createSpecies(validatedSpecies);
      res.json(savedSpecies);
    } catch (error) {
      console.error('Error saving species:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save species' });
    }
  });

  app.get("/api/species", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const species = await storage.getUserSpecies(userId);
      
      if (search) {
        // Filter species by name (case-insensitive)
        const filtered = species.filter(item =>
          item.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(species);
      }
    } catch (error) {
      console.error('Error fetching species:', error);
      res.status(500).json({ error: 'Failed to fetch species' });
    }
  });

  app.get("/api/species/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const species = await storage.getUserSpecies(userId);
      res.json(species);
    } catch (error) {
      console.error('Error fetching species:', error);
      res.status(500).json({ error: 'Failed to fetch species' });
    }
  });

  app.get("/api/species/:id", async (req, res) => {
    try {
      const species = await storage.getSpecies(req.params.id);
      if (!species) {
        return res.status(404).json({ error: 'Species not found' });
      }
      res.json(species);
    } catch (error) {
      console.error('Error fetching species:', error);
      res.status(500).json({ error: 'Failed to fetch species' });
    }
  });

  app.patch("/api/species/:id", async (req, res) => {
    try {
      const updates = insertSpeciesSchema.partial().parse(req.body);
      const updatedSpecies = await storage.updateSpecies(req.params.id, updates);
      res.json(updatedSpecies);
    } catch (error) {
      console.error('Error updating species:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update species' });
    }
  });

  app.delete("/api/species/:id", async (req, res) => {
    try {
      await storage.deleteSpecies(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting species:', error);
      res.status(500).json({ error: 'Failed to delete species' });
    }
  });

  // Organizations routes  
  app.post("/api/organizations", async (req, res) => {
    try {
      // Extract userId from header for security (override client payload)
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const organizationData = { ...req.body, userId };
      
      const validatedOrganization = insertOrganizationSchema.parse(organizationData);
      const savedOrganization = await storage.createOrganization(validatedOrganization);
      res.json(savedOrganization);
    } catch (error) {
      console.error('Error saving organization:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save organization' });
    }
  });

  app.get("/api/organizations", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const organizations = await storage.getUserOrganizations(userId);
      
      if (search) {
        // Filter organizations by name (case-insensitive)
        const filtered = organizations.filter(item =>
          item.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(organizations);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  });

  app.get("/api/organizations/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const organizations = await storage.getUserOrganizations(userId);
      res.json(organizations);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  });

  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const organization = await storage.getOrganization(req.params.id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      res.json(organization);
    } catch (error) {
      console.error('Error fetching organization:', error);
      res.status(500).json({ error: 'Failed to fetch organization' });
    }
  });

  app.patch("/api/organizations/:id", async (req, res) => {
    try {
      const updates = insertOrganizationSchema.partial().parse(req.body);
      const updatedOrganization = await storage.updateOrganization(req.params.id, updates);
      res.json(updatedOrganization);
    } catch (error) {
      console.error('Error updating organization:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update organization' });
    }
  });

  app.delete("/api/organizations/:id", async (req, res) => {
    try {
      await storage.deleteOrganization(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting organization:', error);
      res.status(500).json({ error: 'Failed to delete organization' });
    }
  });

  // Items routes
  app.post("/api/items", async (req, res) => {
    try {
      const validatedItem = insertItemSchema.parse(req.body);
      const savedItem = await storage.createItem(validatedItem);
      res.json(savedItem);
    } catch (error) {
      console.error('Error saving item:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save item' });
    }
  });

  app.get("/api/items", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const items = await storage.getUserItems(userId);
      
      if (search) {
        const filtered = items.filter(item =>
          item.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(items);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  app.get("/api/items/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const items = await storage.getUserItems(userId);
      res.json(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const item = await storage.getItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Error fetching item:', error);
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  });

  app.patch("/api/items/:id", async (req, res) => {
    try {
      const updates = insertItemSchema.partial().parse(req.body);
      const updatedItem = await storage.updateItem(req.params.id, updates);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating item:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update item' });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      await storage.deleteItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  });

  // Culture routes
  app.post("/api/cultures", async (req, res) => {
    try {
      const validatedCulture = insertCultureSchema.parse(req.body);
      const savedCulture = await storage.createCulture(validatedCulture);
      res.json(savedCulture);
    } catch (error) {
      console.error('Error saving culture:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save culture' });
    }
  });

  app.get("/api/cultures", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const cultures = await storage.getUserCultures(userId);
      
      if (search) {
        const filtered = cultures.filter(culture =>
          culture.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(cultures);
      }
    } catch (error) {
      console.error('Error fetching cultures:', error);
      res.status(500).json({ error: 'Failed to fetch cultures' });
    }
  });

  app.get("/api/cultures/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const cultures = await storage.getUserCultures(userId);
      res.json(cultures);
    } catch (error) {
      console.error('Error fetching cultures:', error);
      res.status(500).json({ error: 'Failed to fetch cultures' });
    }
  });

  app.get("/api/cultures/:id", async (req, res) => {
    try {
      const culture = await storage.getCulture(req.params.id);
      if (!culture) {
        return res.status(404).json({ error: 'Culture not found' });
      }
      res.json(culture);
    } catch (error) {
      console.error('Error fetching culture:', error);
      res.status(500).json({ error: 'Failed to fetch culture' });
    }
  });

  app.patch("/api/cultures/:id", async (req, res) => {
    try {
      const updates = insertCultureSchema.partial().parse(req.body);
      const updatedCulture = await storage.updateCulture(req.params.id, updates);
      res.json(updatedCulture);
    } catch (error) {
      console.error('Error updating culture:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update culture' });
    }
  });

  app.delete("/api/cultures/:id", async (req, res) => {
    try {
      await storage.deleteCulture(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting culture:', error);
      res.status(500).json({ error: 'Failed to delete culture' });
    }
  });

  // Document routes
  app.post("/api/documents", async (req, res) => {
    try {
      const validatedDocument = insertDocumentSchema.parse(req.body);
      const savedDocument = await storage.createDocument(validatedDocument);
      res.json(savedDocument);
    } catch (error) {
      console.error('Error saving document:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save document' });
    }
  });

  app.get("/api/documents", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const documents = await storage.getUserDocuments(userId);
      
      if (search) {
        const filtered = documents.filter(document =>
          document.title?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.get("/api/documents/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      res.json(document);
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  });

  app.patch("/api/documents/:id", async (req, res) => {
    try {
      const updates = insertDocumentSchema.partial().parse(req.body);
      const updatedDocument = await storage.updateDocument(req.params.id, updates);
      res.json(updatedDocument);
    } catch (error) {
      console.error('Error updating document:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update document' });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      await storage.deleteDocument(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  // Food routes
  app.post("/api/foods", async (req, res) => {
    try {
      const validatedFood = insertFoodSchema.parse(req.body);
      const savedFood = await storage.createFood(validatedFood);
      res.json(savedFood);
    } catch (error) {
      console.error('Error saving food:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save food' });
    }
  });

  app.get("/api/foods", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const foods = await storage.getUserFoods(userId);
      
      if (search) {
        const filtered = foods.filter(food =>
          food.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(foods);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      res.status(500).json({ error: 'Failed to fetch foods' });
    }
  });

  app.get("/api/foods/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const foods = await storage.getUserFoods(userId);
      res.json(foods);
    } catch (error) {
      console.error('Error fetching foods:', error);
      res.status(500).json({ error: 'Failed to fetch foods' });
    }
  });

  app.get("/api/foods/:id", async (req, res) => {
    try {
      const food = await storage.getFood(req.params.id);
      if (!food) {
        return res.status(404).json({ error: 'Food not found' });
      }
      res.json(food);
    } catch (error) {
      console.error('Error fetching food:', error);
      res.status(500).json({ error: 'Failed to fetch food' });
    }
  });

  app.patch("/api/foods/:id", async (req, res) => {
    try {
      const updates = insertFoodSchema.partial().parse(req.body);
      const updatedFood = await storage.updateFood(req.params.id, updates);
      res.json(updatedFood);
    } catch (error) {
      console.error('Error updating food:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update food' });
    }
  });

  app.delete("/api/foods/:id", async (req, res) => {
    try {
      await storage.deleteFood(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting food:', error);
      res.status(500).json({ error: 'Failed to delete food' });
    }
  });

  // Language routes
  app.post("/api/languages", async (req, res) => {
    try {
      const validatedLanguage = insertLanguageSchema.parse(req.body);
      const savedLanguage = await storage.createLanguage(validatedLanguage);
      res.json(savedLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save language' });
    }
  });

  app.get("/api/languages", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const languages = await storage.getUserLanguages(userId);
      
      if (search) {
        const filtered = languages.filter(language =>
          language.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(languages);
      }
    } catch (error) {
      console.error('Error fetching languages:', error);
      res.status(500).json({ error: 'Failed to fetch languages' });
    }
  });

  app.get("/api/languages/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const languages = await storage.getUserLanguages(userId);
      res.json(languages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      res.status(500).json({ error: 'Failed to fetch languages' });
    }
  });

  app.get("/api/languages/:id", async (req, res) => {
    try {
      const language = await storage.getLanguage(req.params.id);
      if (!language) {
        return res.status(404).json({ error: 'Language not found' });
      }
      res.json(language);
    } catch (error) {
      console.error('Error fetching language:', error);
      res.status(500).json({ error: 'Failed to fetch language' });
    }
  });

  app.patch("/api/languages/:id", async (req, res) => {
    try {
      const updates = insertLanguageSchema.partial().parse(req.body);
      const updatedLanguage = await storage.updateLanguage(req.params.id, updates);
      res.json(updatedLanguage);
    } catch (error) {
      console.error('Error updating language:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update language' });
    }
  });

  app.delete("/api/languages/:id", async (req, res) => {
    try {
      await storage.deleteLanguage(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting language:', error);
      res.status(500).json({ error: 'Failed to delete language' });
    }
  });

  // Religion routes
  app.post("/api/religions", async (req, res) => {
    try {
      const validatedReligion = insertReligionSchema.parse(req.body);
      const savedReligion = await storage.createReligion(validatedReligion);
      res.json(savedReligion);
    } catch (error) {
      console.error('Error saving religion:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save religion' });
    }
  });

  app.get("/api/religions", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const religions = await storage.getUserReligions(userId);
      
      if (search) {
        const filtered = religions.filter(religion =>
          religion.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(religions);
      }
    } catch (error) {
      console.error('Error fetching religions:', error);
      res.status(500).json({ error: 'Failed to fetch religions' });
    }
  });

  app.get("/api/religions/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const religions = await storage.getUserReligions(userId);
      res.json(religions);
    } catch (error) {
      console.error('Error fetching religions:', error);
      res.status(500).json({ error: 'Failed to fetch religions' });
    }
  });

  app.get("/api/religions/:id", async (req, res) => {
    try {
      const religion = await storage.getReligion(req.params.id);
      if (!religion) {
        return res.status(404).json({ error: 'Religion not found' });
      }
      res.json(religion);
    } catch (error) {
      console.error('Error fetching religion:', error);
      res.status(500).json({ error: 'Failed to fetch religion' });
    }
  });

  app.patch("/api/religions/:id", async (req, res) => {
    try {
      const updates = insertReligionSchema.partial().parse(req.body);
      const updatedReligion = await storage.updateReligion(req.params.id, updates);
      res.json(updatedReligion);
    } catch (error) {
      console.error('Error updating religion:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update religion' });
    }
  });

  app.delete("/api/religions/:id", async (req, res) => {
    try {
      await storage.deleteReligion(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting religion:', error);
      res.status(500).json({ error: 'Failed to delete religion' });
    }
  });

  // Technology routes
  app.post("/api/technologies", async (req, res) => {
    try {
      const validatedTechnology = insertTechnologySchema.parse(req.body);
      const savedTechnology = await storage.createTechnology(validatedTechnology);
      res.json(savedTechnology);
    } catch (error) {
      console.error('Error saving technology:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save technology' });
    }
  });

  app.get("/api/technologies", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const technologies = await storage.getUserTechnologies(userId);
      
      if (search) {
        const filtered = technologies.filter(technology =>
          technology.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(technologies);
      }
    } catch (error) {
      console.error('Error fetching technologies:', error);
      res.status(500).json({ error: 'Failed to fetch technologies' });
    }
  });

  app.get("/api/technologies/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const technologies = await storage.getUserTechnologies(userId);
      res.json(technologies);
    } catch (error) {
      console.error('Error fetching technologies:', error);
      res.status(500).json({ error: 'Failed to fetch technologies' });
    }
  });

  app.get("/api/technologies/:id", async (req, res) => {
    try {
      const technology = await storage.getTechnology(req.params.id);
      if (!technology) {
        return res.status(404).json({ error: 'Technology not found' });
      }
      res.json(technology);
    } catch (error) {
      console.error('Error fetching technology:', error);
      res.status(500).json({ error: 'Failed to fetch technology' });
    }
  });

  app.patch("/api/technologies/:id", async (req, res) => {
    try {
      const updates = insertTechnologySchema.partial().parse(req.body);
      const updatedTechnology = await storage.updateTechnology(req.params.id, updates);
      res.json(updatedTechnology);
    } catch (error) {
      console.error('Error updating technology:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update technology' });
    }
  });

  app.delete("/api/technologies/:id", async (req, res) => {
    try {
      await storage.deleteTechnology(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting technology:', error);
      res.status(500).json({ error: 'Failed to delete technology' });
    }
  });

  // Weapon routes
  app.post("/api/weapons", async (req, res) => {
    try {
      const validatedWeapon = insertWeaponSchema.parse(req.body);
      const savedWeapon = await storage.createWeapon(validatedWeapon);
      res.json(savedWeapon);
    } catch (error) {
      console.error('Error saving weapon:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save weapon' });
    }
  });

  app.get("/api/weapons", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const weapons = await storage.getUserWeapons(userId);
      
      if (search) {
        const filtered = weapons.filter(weapon =>
          weapon.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(weapons);
      }
    } catch (error) {
      console.error('Error fetching weapons:', error);
      res.status(500).json({ error: 'Failed to fetch weapons' });
    }
  });

  app.get("/api/weapons/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const weapons = await storage.getUserWeapons(userId);
      res.json(weapons);
    } catch (error) {
      console.error('Error fetching weapons:', error);
      res.status(500).json({ error: 'Failed to fetch weapons' });
    }
  });

  app.get("/api/weapons/:id", async (req, res) => {
    try {
      const weapon = await storage.getWeapon(req.params.id);
      if (!weapon) {
        return res.status(404).json({ error: 'Weapon not found' });
      }
      res.json(weapon);
    } catch (error) {
      console.error('Error fetching weapon:', error);
      res.status(500).json({ error: 'Failed to fetch weapon' });
    }
  });

  app.patch("/api/weapons/:id", async (req, res) => {
    try {
      const updates = insertWeaponSchema.partial().parse(req.body);
      const updatedWeapon = await storage.updateWeapon(req.params.id, updates);
      res.json(updatedWeapon);
    } catch (error) {
      console.error('Error updating weapon:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update weapon' });
    }
  });

  app.delete("/api/weapons/:id", async (req, res) => {
    try {
      await storage.deleteWeapon(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting weapon:', error);
      res.status(500).json({ error: 'Failed to delete weapon' });
    }
  });

  // Profession routes
  app.post("/api/professions", async (req, res) => {
    try {
      // Extract userId from header for security (override client payload)
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const professionData = { ...req.body, userId };
      
      const validatedProfession = insertProfessionSchema.parse(professionData);
      const savedProfession = await storage.createProfession(validatedProfession);
      res.json(savedProfession);
    } catch (error) {
      console.error('Error saving profession:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save profession' });
    }
  });

  // Get profession by id
  app.get("/api/professions/:id", async (req, res) => {
    try {
      const profession = await storage.getProfession(req.params.id);
      if (!profession) {
        return res.status(404).json({ error: 'Profession not found' });
      }
      res.json(profession);
    } catch (error) {
      console.error('Error fetching profession:', error);
      res.status(500).json({ error: 'Failed to fetch profession' });
    }
  });

  app.get("/api/professions", async (req, res) => {
    try {
      const search = req.query.search as string;
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const professions = await storage.getUserProfessions(userId);
      
      if (search) {
        const filtered = professions.filter(item =>
          item.name?.toLowerCase().includes(search.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(professions);
      }
    } catch (error) {
      console.error('Error fetching professions:', error);
      res.status(500).json({ error: 'Failed to fetch professions' });
    }
  });

  app.put("/api/professions/:id", async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string || 'demo-user';
      const professionData = { ...req.body, userId };
      
      const validatedUpdates = insertProfessionSchema.partial().parse(professionData);
      const updatedProfession = await storage.updateProfession(req.params.id, validatedUpdates);
      res.json(updatedProfession);
    } catch (error) {
      console.error('Error updating profession:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update profession' });
    }
  });

  app.delete("/api/professions/:id", async (req, res) => {
    try {
      await storage.deleteProfession(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting profession:', error);
      res.status(500).json({ error: 'Failed to delete profession' });
    }
  });

  // Folder routes
  app.post("/api/folders", async (req, res) => {
    try {
      const folder = insertFolderSchema.parse(req.body);
      const newFolder = await storage.createFolder(folder);
      res.status(201).json(newFolder);
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(400).json({ error: 'Failed to create folder' });
    }
  });

  app.get("/api/folders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const folder = await storage.getFolder(id);
      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' });
      }
      res.json(folder);
    } catch (error) {
      console.error('Error fetching folder:', error);
      res.status(500).json({ error: 'Failed to fetch folder' });
    }
  });

  app.get("/api/folders", async (req, res) => {
    try {
      const { userId, type } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const folders = await storage.getUserFolders(userId as string, type as string);
      res.json(folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ error: 'Failed to fetch folders' });
    }
  });

  app.get("/api/folders/:userId/:type/hierarchy", async (req, res) => {
    try {
      const { userId, type } = req.params;
      const folders = await storage.getFolderHierarchy(userId, type);
      res.json(folders);
    } catch (error) {
      console.error('Error fetching folder hierarchy:', error);
      res.status(500).json({ error: 'Failed to fetch folder hierarchy' });
    }
  });

  app.put("/api/folders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, ...updates } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const folder = await storage.updateFolder(id, userId, updates);
      res.json(folder);
    } catch (error: any) {
      console.error('Error updating folder:', error);
      if (error.message === 'Folder not found or unauthorized') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update folder' });
      }
    }
  });

  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      await storage.deleteFolder(id, userId as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting folder:', error);
      res.status(500).json({ error: 'Failed to delete folder' });
    }
  });

  // Note routes
  app.post("/api/notes", async (req, res) => {
    try {
      const note = insertNoteSchema.parse(req.body);
      const newNote = await storage.createNote(note);
      res.status(201).json(newNote);
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(400).json({ error: 'Failed to create note' });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }
      res.json(note);
    } catch (error) {
      console.error('Error fetching note:', error);
      res.status(500).json({ error: 'Failed to fetch note' });
    }
  });

  app.get("/api/notes", async (req, res) => {
    try {
      const { userId, type, folderId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      let notes;
      if (folderId) {
        notes = await storage.getFolderNotes(folderId as string, userId as string);
      } else {
        notes = await storage.getUserNotes(userId as string, type as string);
      }
      res.json(notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, ...updates } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      const note = await storage.updateNote(id, userId, updates);
      res.json(note);
    } catch (error: any) {
      console.error('Error updating note:', error);
      if (error.message === 'Note not found or unauthorized') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update note' });
      }
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      await storage.deleteNote(id, userId as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ error: 'Failed to delete note' });
    }
  });

  // Quick note routes
  app.post("/api/quick-note", async (req, res) => {
    try {
      const { userId, title, content } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      // Check if user already has a quick note
      const existingNote = await storage.getUserQuickNote(userId);
      if (existingNote) {
        // Update existing quick note
        const updatedNote = await storage.updateQuickNote(existingNote.id, userId, { title, content });
        res.json(updatedNote);
      } else {
        // Create new quick note
        const newNote = await storage.createQuickNote(userId, title || 'Quick Note', content || '');
        res.status(201).json(newNote);
      }
    } catch (error) {
      console.error('Error saving quick note:', error);
      res.status(500).json({ error: 'Failed to save quick note' });
    }
  });

  app.get("/api/quick-note", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      const quickNote = await storage.getUserQuickNote(userId as string);
      if (!quickNote) {
        return res.status(404).json({ error: 'Quick note not found' });
      }
      
      res.json(quickNote);
    } catch (error) {
      console.error('Error fetching quick note:', error);
      res.status(500).json({ error: 'Failed to fetch quick note' });
    }
  });

  app.delete("/api/quick-note", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }
      
      const quickNote = await storage.getUserQuickNote(userId as string);
      if (!quickNote) {
        return res.status(404).json({ error: 'Quick note not found' });
      }
      
      await storage.deleteQuickNote(quickNote.id, userId as string);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting quick note:', error);
      res.status(500).json({ error: 'Failed to delete quick note' });
    }
  });

  // Writing Assistant API routes
  app.post("/api/writing-assistant/analyze", async (req, res) => {
    try {
      const { text } = z.object({ text: z.string() }).parse(req.body);
      const analysis = await analyzeText(text);
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing text:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/writing-assistant/rephrase", async (req, res) => {
    try {
      const { text, style } = z.object({ 
        text: z.string(), 
        style: z.string() 
      }).parse(req.body);
      const rephrased = await rephraseText(text, style);
      res.json({ text: rephrased });
    } catch (error) {
      console.error('Error rephrasing text:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/writing-assistant/proofread", async (req, res) => {
    try {
      const { text } = z.object({ text: z.string() }).parse(req.body);
      const result = await proofreadText(text);
      res.json(result);
    } catch (error) {
      console.error('Error proofreading text:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/writing-assistant/synonyms", async (req, res) => {
    try {
      const { word } = z.object({ word: z.string() }).parse(req.body);
      const synonyms = await generateSynonyms(word);
      res.json({ synonyms });
    } catch (error) {
      console.error('Error generating synonyms:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/writing-assistant/definition", async (req, res) => {
    try {
      const { word } = z.object({ word: z.string() }).parse(req.body);
      const definition = await getWordDefinition(word);
      res.json({ definition });
    } catch (error) {
      console.error('Error getting word definition:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/writing-assistant/questions", async (req, res) => {
    try {
      const { text } = z.object({ text: z.string() }).parse(req.body);
      const questions = await generateQuestions(text);
      res.json({ questions });
    } catch (error) {
      console.error('Error generating questions:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/writing-assistant/improve", async (req, res) => {
    try {
      const { text, instruction } = z.object({ 
        text: z.string(), 
        instruction: z.string() 
      }).parse(req.body);
      const improved = await improveText(text, instruction);
      res.json({ text: improved });
    } catch (error) {
      console.error('Error improving text:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for generating random content
function generateRandomName(): string {
  const names = ["Elena", "Marcus", "Zara", "Kai", "Luna", "Dex", "Nova", "Orion", "Maya", "Finn", "Aria", "Phoenix", "Sage", "River", "Storm"];
  return names[Math.floor(Math.random() * names.length)];
}

function generateRandomSetup(): string {
  const setups = [
    "In a world where magic is forbidden, a young apprentice discovers they possess incredible powers",
    "A detective investigating a series of mysterious disappearances uncovers a conspiracy that goes to the highest levels of government",
    "After a global catastrophe, survivors must navigate a dangerous new world filled with strange creatures",
    "A time traveler accidentally changes history and must find a way to set things right",
    "In a society where emotions are illegal, a rebel group fights to restore humanity's right to feel"
  ];
  return setups[Math.floor(Math.random() * setups.length)];
}

function generateRandomTheme(): string {
  const themes = ["Redemption", "Coming of age", "Good vs. evil", "Love conquers all", "Power corrupts", "Identity and self-discovery"];
  return themes[Math.floor(Math.random() * themes.length)];
}

function generateRandomConflict(): string {
  const conflicts = ["Man vs. nature", "Man vs. society", "Man vs. self", "Man vs. technology", "Man vs. fate"];
  return conflicts[Math.floor(Math.random() * conflicts.length)];
}

function getRandomGenre(): string {
  const genres = ["Fantasy", "Science Fiction", "Mystery", "Romance", "Horror", "Thriller", "Historical Fiction", "Literary Fiction"];
  return genres[Math.floor(Math.random() * genres.length)];
}

function getRandomDifficulty(): string {
  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

function getRandomPromptType(): string {
  const types = ["Character", "Setting", "Plot", "Dialogue", "First Line", "What If"];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomWordCount(): number {
  const wordCounts = [100, 250, 500, 1000, 1500, 2000];
  return wordCounts[Math.floor(Math.random() * wordCounts.length)];
}

function generateRandomNames(nameType: string, culture: string, userId: string | null): any[] {
  const firstNames = ["Aria", "Zara", "Kai", "Luna", "Dex", "Nova", "Orion", "Maya", "Finn", "Phoenix"];
  const lastNames = ["Stormwind", "Shadowbane", "Goldleaf", "Ironforge", "Moonwhisper", "Starfall", "Bloodmoon", "Frostborn", "Earthshaker", "Voidwalker"];
  
  const names = [];
  for (let i = 0; i < 10; i++) {
    names.push({
      name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
      nameType,
      culture,
      userId
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
    "The Final Choice"
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateRandomConflictType(): string {
  const types = ["Internal", "Interpersonal", "External", "Societal", "Supernatural", "Moral"];
  return types[Math.floor(Math.random() * types.length)];
}

function generateRandomConflictDescription(): string {
  const descriptions = [
    "A deep-seated disagreement that threatens to tear apart everything the characters hold dear",
    "An ancient rivalry that resurfaces at the worst possible moment",
    "A moral dilemma that forces characters to choose between their values and survival",
    "A power struggle that reveals the true nature of those involved",
    "A secret that, once revealed, changes everything"
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomStakes(): string {
  const stakes = [
    "The fate of the kingdom hangs in the balance",
    "Lives of innocent people are at risk",
    "The character's deepest relationships are threatened",
    "Everything they've worked for could be lost",
    "The very fabric of reality might be torn apart"
  ];
  return stakes[Math.floor(Math.random() * stakes.length)];
}

function generateRandomObstacles(): string {
  const obstacles = [
    "Powerful enemies who will stop at nothing",
    "Time is running out before disaster strikes",
    "The character's own fears and doubts",
    "Limited resources and impossible odds",
    "Conflicting loyalties that create difficult choices"
  ];
  return obstacles[Math.floor(Math.random() * obstacles.length)];
}

function generateRandomResolutions(): string {
  const resolutions = [
    "A sacrifice that saves everyone but costs everything",
    "Finding an unexpected ally in a former enemy",
    "Discovering inner strength to overcome the impossible",
    "A clever plan that turns weakness into strength",
    "Learning that some conflicts can only be resolved through understanding"
  ];
  return resolutions[Math.floor(Math.random() * resolutions.length)];
}

function generateRandomEmotionalImpact(): string {
  const impacts = [
    "Forces characters to confront their deepest fears",
    "Reveals hidden strengths and vulnerabilities",
    "Tests the bonds of friendship and loyalty",
    "Challenges long-held beliefs and assumptions",
    "Creates lasting change in how characters see the world"
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
    "The Burden of Legacy"
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateRandomThemeDescription(): string {
  const descriptions = [
    "An exploration of what it means to be human in challenging circumstances",
    "The universal struggle between personal desires and greater responsibility",
    "How individuals respond when their core beliefs are tested",
    "The transformative power of relationships and connection",
    "The price we pay for the choices we make"
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomCoreMessage(): string {
  const messages = [
    "True strength comes from facing our vulnerabilities",
    "The most powerful force in the universe is compassion",
    "Sometimes losing everything is the only way to find yourself",
    "The greatest battles are fought within our own hearts",
    "Hope can survive in even the darkest circumstances"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateRandomSymbolicElements(): string {
  const elements = [
    "Light and darkness representing knowledge and ignorance",
    "Bridges symbolizing connection and transition",
    "Storms as metaphors for internal turmoil",
    "Gardens representing growth and nurturing",
    "Mirrors reflecting self-discovery and truth"
  ];
  return elements[Math.floor(Math.random() * elements.length)];
}

function generateRandomThematicQuestions(): string {
  const questions = [
    "What does it mean to be truly free?",
    "How do we find meaning in suffering?",
    "What is the difference between justice and revenge?",
    "Can love survive betrayal?",
    "What price are we willing to pay for our dreams?"
  ];
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateRandomThematicConflicts(): string {
  const conflicts = [
    "Individual desires versus collective needs",
    "Tradition versus progress and change",
    "The known versus the unknown",
    "Safety versus adventure and growth",
    "Truth versus comfortable illusions"
  ];
  return conflicts[Math.floor(Math.random() * conflicts.length)];
}

function generateRandomLiteraryExamples(): string {
  const examples = [
    "Like Atticus Finch standing up for justice despite social pressure",
    "Similar to Elizabeth Bennet overcoming her prejudices",
    "Reminiscent of Jean Valjean's journey toward redemption",
    "Echoing Frodo's burden and the corrupting power of the Ring",
    "Parallel to Scout Finch's loss of innocence"
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
    "Mysterious Allure"
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
    "An intriguing ambiance that draws you deeper into the story"
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomEmotionalTone(): string {
  const tones = ["Hopeful", "Melancholic", "Mysterious", "Energetic", "Peaceful", "Tense", "Romantic"];
  return tones[Math.floor(Math.random() * tones.length)];
}

function generateRandomSensoryDetails(): string {
  const details = [
    "The scent of rain on warm earth",
    "Soft candlelight flickering against stone walls",
    "The distant sound of ocean waves",
    "Cool morning mist and fresh pine",
    "The warmth of sunlight through autumn leaves"
  ];
  return details[Math.floor(Math.random() * details.length)];
}

function generateRandomColorAssociations(): string {
  const colors = [
    "Deep blues and silver",
    "Warm golds and amber",
    "Rich purples and violet",
    "Soft greens and cream",
    "Dusky rose and charcoal"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateRandomWeatherElements(): string {
  const weather = [
    "Gentle rainfall",
    "Golden sunset",
    "Misty morning",
    "Starlit night",
    "Autumn breeze"
  ];
  return weather[Math.floor(Math.random() * weather.length)];
}

function generateRandomLightingEffects(): string {
  const lighting = [
    "Soft, diffused light",
    "Dramatic shadows",
    "Warm, glowing ambiance",
    "Cool, ethereal illumination",
    "Flickering, unstable light"
  ];
  return lighting[Math.floor(Math.random() * lighting.length)];
}

function generateRandomSoundscape(): string {
  const sounds = [
    "Distant thunder and rain",
    "Gentle wind through trees",
    "Crackling fireplace",
    "Soft instrumental music",
    "Echoing footsteps in empty halls"
  ];
  return sounds[Math.floor(Math.random() * sounds.length)];
}