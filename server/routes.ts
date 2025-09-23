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
  insertPlantSchema,
  insertDescriptionSchema,
  insertLocationSchema,
  insertItemSchema,
  insertOrganizationSchema,
  insertSpeciesSchema,
  insertEthnicitySchema,
  insertCultureSchema,
  insertDocumentSchema,
  insertFoodSchema,
  insertDrinkSchema,
  insertWeaponSchema,
  insertArmorSchema,
  insertReligionSchema,
  insertLanguageSchema,
  insertAccessorySchema,
  insertClothingSchema,
  insertMaterialSchema,
  insertSettlementSchema,
  insertSocietySchema,
  insertFactionSchema,
  insertMilitaryUnitSchema,
  insertMythSchema,
  insertLegendSchema,
  insertEventSchema,
  insertTechnologySchema,
  insertSpellSchema,
  insertResourceSchema,
  insertBuildingSchema,
  insertAnimalSchema,
  insertTransportationSchema,
  insertNaturalLawSchema,
  insertTraditionSchema,
  insertRitualSchema
} from "@shared/schema";
import { z } from "zod";
import { generateCharacterWithAI, generateSettingWithAI, generateCreatureWithAI, generatePlantWithAI, generatePromptWithAI, generateDescriptionWithAI, generateCharacterFieldWithAI } from "./ai-generation";
import { ALL_DESCRIPTION_TYPES } from "./genres";

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
      // Validate the request body using the insert schema
      const validatedCharacter = insertCharacterSchema.parse(req.body);
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
      // For now, return all characters. In a real app with auth, this would be user-scoped
      const characters = await storage.getUserCharacters(null);
      res.json(characters);
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
      // Validate the request body against the update schema
      const validatedUpdates = updateCharacterSchema.parse(req.body);
      const updatedCharacter = await storage.updateCharacter(req.params.id, validatedUpdates);
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
      const prompts = await storage.getRandomPrompts(count, genre);
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
          category as string,
          difficulty as string
        );
      } else {
        guides = await storage.getAllGuides();
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

  // Plant generator routes
  app.post("/api/plants/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        genre: z.string().optional(),
        type: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { genre, type, userId } = generateRequestSchema.parse(req.body);
      
      // Use AI generation
      const aiPlant = await generatePlantWithAI({ genre, type });
      
      const plant = {
        name: aiPlant.name,
        scientificName: aiPlant.scientificName,
        type: aiPlant.type,
        description: aiPlant.description,
        characteristics: aiPlant.characteristics,
        habitat: aiPlant.habitat,
        careInstructions: aiPlant.careInstructions,
        bloomingSeason: aiPlant.bloomingSeason,
        hardinessZone: aiPlant.hardinessZone,
        genre: genre || null,
        userId: userId || null
      };

      // Validate the generated plant data before saving
      const validatedPlant = insertPlantSchema.parse(plant);
      const savedPlant = await storage.createPlant(validatedPlant);
      res.json(savedPlant);
    } catch (error) {
      console.error('Error generating plant:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/plants/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const plants = await storage.getUserPlants(userId);
      res.json(plants);
    } catch (error) {
      console.error('Error fetching plants:', error);
      res.status(500).json({ error: 'Failed to fetch plants' });
    }
  });

  app.get("/api/plants/:id", async (req, res) => {
    try {
      const plant = await storage.getPlant(req.params.id);
      if (!plant) {
        return res.status(404).json({ error: 'Plant not found' });
      }
      res.json(plant);
    } catch (error) {
      console.error('Error fetching plant:', error);
      res.status(500).json({ error: 'Failed to fetch plant' });
    }
  });

  // Description generator routes
  app.post("/api/descriptions/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        descriptionType: z.enum(ALL_DESCRIPTION_TYPES as [string, ...string[]]),
        genre: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { descriptionType, genre, userId } = generateRequestSchema.parse(req.body);
      
      // Use AI generation
      const aiDescription = await generateDescriptionWithAI({ descriptionType, genre });
      
      const description = {
        title: aiDescription.title,
        content: aiDescription.content,
        descriptionType,
        genre: genre || null,
        tags: aiDescription.tags || [],
        userId: userId || null
      };

      // Validate the generated description data before saving
      const validatedDescription = insertDescriptionSchema.parse(description);
      const savedDescription = await storage.createDescription(validatedDescription);
      res.json(savedDescription);
    } catch (error) {
      console.error('Error generating description:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/descriptions", async (req, res) => {
    try {
      const validatedDescription = insertDescriptionSchema.parse(req.body);
      const savedDescription = await storage.createDescription(validatedDescription);
      res.json(savedDescription);
    } catch (error) {
      console.error('Error saving description:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save description' });
    }
  });

  app.get("/api/descriptions/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const descriptions = await storage.getUserDescriptions(userId);
      res.json(descriptions);
    } catch (error) {
      console.error('Error fetching descriptions:', error);
      res.status(500).json({ error: 'Failed to fetch descriptions' });
    }
  });

  app.get("/api/descriptions/:id", async (req, res) => {
    try {
      const description = await storage.getDescription(req.params.id);
      if (!description) {
        return res.status(404).json({ error: 'Description not found' });
      }
      res.json(description);
    } catch (error) {
      console.error('Error fetching description:', error);
      res.status(500).json({ error: 'Failed to fetch description' });
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

      const validatedNames = namesList.map(name => insertNameSchema.parse(name));
      const savedNames = await storage.createNames(validatedNames);
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
      const validatedNames = names.map((name: any) => insertNameSchema.parse(name));
      const savedNames = await storage.createNames(validatedNames);
      res.json(savedNames);
    } catch (error) {
      console.error('Error saving names:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save names' });
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

  // Saved items routes
  app.post("/api/saved-items", async (req, res) => {
    try {
      const validatedData = insertSavedItemSchema.parse(req.body);
      const savedItem = await storage.saveItem(validatedData);
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

  // Location routes
  app.post("/api/locations", async (req, res) => {
    try {
      const validatedLocation = insertLocationSchema.parse(req.body);
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

  // Species routes
  app.post("/api/species", async (req, res) => {
    try {
      const validatedSpecies = insertSpeciesSchema.parse(req.body);
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

  // Organizations routes  
  app.post("/api/organizations", async (req, res) => {
    try {
      const validatedOrganization = insertOrganizationSchema.parse(req.body);
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

  // PATCH and DELETE routes for existing content types
  
  // Location PATCH and DELETE
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

  // Species PATCH and DELETE
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

  // Organization PATCH and DELETE
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

  // Ethnicities routes
  app.post("/api/ethnicities", async (req, res) => {
    try {
      const validatedEthnicity = insertEthnicitySchema.parse(req.body);
      const savedEthnicity = await storage.createEthnicity(validatedEthnicity);
      res.json(savedEthnicity);
    } catch (error) {
      console.error('Error saving ethnicity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save ethnicity' });
    }
  });

  app.get("/api/ethnicities/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const ethnicities = await storage.getUserEthnicities(userId);
      res.json(ethnicities);
    } catch (error) {
      console.error('Error fetching ethnicities:', error);
      res.status(500).json({ error: 'Failed to fetch ethnicities' });
    }
  });

  app.get("/api/ethnicities/:id", async (req, res) => {
    try {
      const ethnicity = await storage.getEthnicity(req.params.id);
      if (!ethnicity) {
        return res.status(404).json({ error: 'Ethnicity not found' });
      }
      res.json(ethnicity);
    } catch (error) {
      console.error('Error fetching ethnicity:', error);
      res.status(500).json({ error: 'Failed to fetch ethnicity' });
    }
  });

  app.patch("/api/ethnicities/:id", async (req, res) => {
    try {
      const updates = insertEthnicitySchema.partial().parse(req.body);
      const updatedEthnicity = await storage.updateEthnicity(req.params.id, updates);
      res.json(updatedEthnicity);
    } catch (error) {
      console.error('Error updating ethnicity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update ethnicity' });
    }
  });

  app.delete("/api/ethnicities/:id", async (req, res) => {
    try {
      await storage.deleteEthnicity(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting ethnicity:', error);
      res.status(500).json({ error: 'Failed to delete ethnicity' });
    }
  });

  // Cultures routes
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

  // Documents routes
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

  // Foods routes
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

  // Drinks routes
  app.post("/api/drinks", async (req, res) => {
    try {
      const validatedDrink = insertDrinkSchema.parse(req.body);
      const savedDrink = await storage.createDrink(validatedDrink);
      res.json(savedDrink);
    } catch (error) {
      console.error('Error saving drink:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save drink' });
    }
  });

  app.get("/api/drinks/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const drinks = await storage.getUserDrinks(userId);
      res.json(drinks);
    } catch (error) {
      console.error('Error fetching drinks:', error);
      res.status(500).json({ error: 'Failed to fetch drinks' });
    }
  });

  app.get("/api/drinks/:id", async (req, res) => {
    try {
      const drink = await storage.getDrink(req.params.id);
      if (!drink) {
        return res.status(404).json({ error: 'Drink not found' });
      }
      res.json(drink);
    } catch (error) {
      console.error('Error fetching drink:', error);
      res.status(500).json({ error: 'Failed to fetch drink' });
    }
  });

  app.patch("/api/drinks/:id", async (req, res) => {
    try {
      const updates = insertDrinkSchema.partial().parse(req.body);
      const updatedDrink = await storage.updateDrink(req.params.id, updates);
      res.json(updatedDrink);
    } catch (error) {
      console.error('Error updating drink:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update drink' });
    }
  });

  app.delete("/api/drinks/:id", async (req, res) => {
    try {
      await storage.deleteDrink(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting drink:', error);
      res.status(500).json({ error: 'Failed to delete drink' });
    }
  });

  // Weapons routes
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

  // Armor routes
  app.post("/api/armor", async (req, res) => {
    try {
      const validatedArmor = insertArmorSchema.parse(req.body);
      const savedArmor = await storage.createArmor(validatedArmor);
      res.json(savedArmor);
    } catch (error) {
      console.error('Error saving armor:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save armor' });
    }
  });

  app.get("/api/armor/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const armor = await storage.getUserArmor(userId);
      res.json(armor);
    } catch (error) {
      console.error('Error fetching armor:', error);
      res.status(500).json({ error: 'Failed to fetch armor' });
    }
  });

  app.get("/api/armor/:id", async (req, res) => {
    try {
      const armor = await storage.getArmor(req.params.id);
      if (!armor) {
        return res.status(404).json({ error: 'Armor not found' });
      }
      res.json(armor);
    } catch (error) {
      console.error('Error fetching armor:', error);
      res.status(500).json({ error: 'Failed to fetch armor' });
    }
  });

  app.patch("/api/armor/:id", async (req, res) => {
    try {
      const updates = insertArmorSchema.partial().parse(req.body);
      const updatedArmor = await storage.updateArmor(req.params.id, updates);
      res.json(updatedArmor);
    } catch (error) {
      console.error('Error updating armor:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update armor' });
    }
  });

  app.delete("/api/armor/:id", async (req, res) => {
    try {
      await storage.deleteArmor(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting armor:', error);
      res.status(500).json({ error: 'Failed to delete armor' });
    }
  });

  // Accessories routes
  app.post("/api/accessories", async (req, res) => {
    try {
      const validatedAccessory = insertAccessorySchema.parse(req.body);
      const savedAccessory = await storage.createAccessory(validatedAccessory);
      res.json(savedAccessory);
    } catch (error) {
      console.error('Error saving accessory:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save accessory' });
    }
  });

  app.get("/api/accessories/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const accessories = await storage.getUserAccessories(userId);
      res.json(accessories);
    } catch (error) {
      console.error('Error fetching accessories:', error);
      res.status(500).json({ error: 'Failed to fetch accessories' });
    }
  });

  app.get("/api/accessories/:id", async (req, res) => {
    try {
      const accessory = await storage.getAccessory(req.params.id);
      if (!accessory) {
        return res.status(404).json({ error: 'Accessory not found' });
      }
      res.json(accessory);
    } catch (error) {
      console.error('Error fetching accessory:', error);
      res.status(500).json({ error: 'Failed to fetch accessory' });
    }
  });

  app.patch("/api/accessories/:id", async (req, res) => {
    try {
      const updates = insertAccessorySchema.partial().parse(req.body);
      const updatedAccessory = await storage.updateAccessory(req.params.id, updates);
      res.json(updatedAccessory);
    } catch (error) {
      console.error('Error updating accessory:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update accessory' });
    }
  });

  app.delete("/api/accessories/:id", async (req, res) => {
    try {
      await storage.deleteAccessory(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting accessory:', error);
      res.status(500).json({ error: 'Failed to delete accessory' });
    }
  });

  // Clothing routes
  app.post("/api/clothing", async (req, res) => {
    try {
      const validatedClothing = insertClothingSchema.parse(req.body);
      const savedClothing = await storage.createClothing(validatedClothing);
      res.json(savedClothing);
    } catch (error) {
      console.error('Error saving clothing:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save clothing' });
    }
  });

  app.get("/api/clothing/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const clothing = await storage.getUserClothing(userId);
      res.json(clothing);
    } catch (error) {
      console.error('Error fetching clothing:', error);
      res.status(500).json({ error: 'Failed to fetch clothing' });
    }
  });

  app.get("/api/clothing/:id", async (req, res) => {
    try {
      const clothing = await storage.getClothing(req.params.id);
      if (!clothing) {
        return res.status(404).json({ error: 'Clothing not found' });
      }
      res.json(clothing);
    } catch (error) {
      console.error('Error fetching clothing:', error);
      res.status(500).json({ error: 'Failed to fetch clothing' });
    }
  });

  app.patch("/api/clothing/:id", async (req, res) => {
    try {
      const updates = insertClothingSchema.partial().parse(req.body);
      const updatedClothing = await storage.updateClothing(req.params.id, updates);
      res.json(updatedClothing);
    } catch (error) {
      console.error('Error updating clothing:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update clothing' });
    }
  });

  app.delete("/api/clothing/:id", async (req, res) => {
    try {
      await storage.deleteClothing(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting clothing:', error);
      res.status(500).json({ error: 'Failed to delete clothing' });
    }
  });

  // Materials routes
  app.post("/api/materials", async (req, res) => {
    try {
      const validatedMaterial = insertMaterialSchema.parse(req.body);
      const savedMaterial = await storage.createMaterial(validatedMaterial);
      res.json(savedMaterial);
    } catch (error) {
      console.error('Error saving material:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save material' });
    }
  });

  app.get("/api/materials/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const materials = await storage.getUserMaterials(userId);
      res.json(materials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      res.status(500).json({ error: 'Failed to fetch materials' });
    }
  });

  app.get("/api/materials/:id", async (req, res) => {
    try {
      const material = await storage.getMaterial(req.params.id);
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
      res.json(material);
    } catch (error) {
      console.error('Error fetching material:', error);
      res.status(500).json({ error: 'Failed to fetch material' });
    }
  });

  app.patch("/api/materials/:id", async (req, res) => {
    try {
      const updates = insertMaterialSchema.partial().parse(req.body);
      const updatedMaterial = await storage.updateMaterial(req.params.id, updates);
      res.json(updatedMaterial);
    } catch (error) {
      console.error('Error updating material:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update material' });
    }
  });

  app.delete("/api/materials/:id", async (req, res) => {
    try {
      await storage.deleteMaterial(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting material:', error);
      res.status(500).json({ error: 'Failed to delete material' });
    }
  });

  // Settlements routes
  app.post("/api/settlements", async (req, res) => {
    try {
      const validatedSettlement = insertSettlementSchema.parse(req.body);
      const savedSettlement = await storage.createSettlement(validatedSettlement);
      res.json(savedSettlement);
    } catch (error) {
      console.error('Error saving settlement:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save settlement' });
    }
  });

  app.get("/api/settlements/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const settlements = await storage.getUserSettlements(userId);
      res.json(settlements);
    } catch (error) {
      console.error('Error fetching settlements:', error);
      res.status(500).json({ error: 'Failed to fetch settlements' });
    }
  });

  app.get("/api/settlements/:id", async (req, res) => {
    try {
      const settlement = await storage.getSettlement(req.params.id);
      if (!settlement) {
        return res.status(404).json({ error: 'Settlement not found' });
      }
      res.json(settlement);
    } catch (error) {
      console.error('Error fetching settlement:', error);
      res.status(500).json({ error: 'Failed to fetch settlement' });
    }
  });

  app.patch("/api/settlements/:id", async (req, res) => {
    try {
      const updates = insertSettlementSchema.partial().parse(req.body);
      const updatedSettlement = await storage.updateSettlement(req.params.id, updates);
      res.json(updatedSettlement);
    } catch (error) {
      console.error('Error updating settlement:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update settlement' });
    }
  });

  app.delete("/api/settlements/:id", async (req, res) => {
    try {
      await storage.deleteSettlement(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting settlement:', error);
      res.status(500).json({ error: 'Failed to delete settlement' });
    }
  });

  // Societies routes
  app.post("/api/societies", async (req, res) => {
    try {
      const validatedSociety = insertSocietySchema.parse(req.body);
      const savedSociety = await storage.createSociety(validatedSociety);
      res.json(savedSociety);
    } catch (error) {
      console.error('Error saving society:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save society' });
    }
  });

  app.get("/api/societies/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const societies = await storage.getUserSocieties(userId);
      res.json(societies);
    } catch (error) {
      console.error('Error fetching societies:', error);
      res.status(500).json({ error: 'Failed to fetch societies' });
    }
  });

  app.get("/api/societies/:id", async (req, res) => {
    try {
      const society = await storage.getSociety(req.params.id);
      if (!society) {
        return res.status(404).json({ error: 'Society not found' });
      }
      res.json(society);
    } catch (error) {
      console.error('Error fetching society:', error);
      res.status(500).json({ error: 'Failed to fetch society' });
    }
  });

  app.patch("/api/societies/:id", async (req, res) => {
    try {
      const updates = insertSocietySchema.partial().parse(req.body);
      const updatedSociety = await storage.updateSociety(req.params.id, updates);
      res.json(updatedSociety);
    } catch (error) {
      console.error('Error updating society:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update society' });
    }
  });

  app.delete("/api/societies/:id", async (req, res) => {
    try {
      await storage.deleteSociety(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting society:', error);
      res.status(500).json({ error: 'Failed to delete society' });
    }
  });

  // Factions routes
  app.post("/api/factions", async (req, res) => {
    try {
      const validatedFaction = insertFactionSchema.parse(req.body);
      const savedFaction = await storage.createFaction(validatedFaction);
      res.json(savedFaction);
    } catch (error) {
      console.error('Error saving faction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save faction' });
    }
  });

  app.get("/api/factions/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const factions = await storage.getUserFactions(userId);
      res.json(factions);
    } catch (error) {
      console.error('Error fetching factions:', error);
      res.status(500).json({ error: 'Failed to fetch factions' });
    }
  });

  app.get("/api/factions/:id", async (req, res) => {
    try {
      const faction = await storage.getFaction(req.params.id);
      if (!faction) {
        return res.status(404).json({ error: 'Faction not found' });
      }
      res.json(faction);
    } catch (error) {
      console.error('Error fetching faction:', error);
      res.status(500).json({ error: 'Failed to fetch faction' });
    }
  });

  app.patch("/api/factions/:id", async (req, res) => {
    try {
      const updates = insertFactionSchema.partial().parse(req.body);
      const updatedFaction = await storage.updateFaction(req.params.id, updates);
      res.json(updatedFaction);
    } catch (error) {
      console.error('Error updating faction:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update faction' });
    }
  });

  app.delete("/api/factions/:id", async (req, res) => {
    try {
      await storage.deleteFaction(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting faction:', error);
      res.status(500).json({ error: 'Failed to delete faction' });
    }
  });

  // Military Units routes
  app.post("/api/militaryunits", async (req, res) => {
    try {
      const validatedMilitaryUnit = insertMilitaryUnitSchema.parse(req.body);
      const savedMilitaryUnit = await storage.createMilitaryUnit(validatedMilitaryUnit);
      res.json(savedMilitaryUnit);
    } catch (error) {
      console.error('Error saving military unit:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save military unit' });
    }
  });

  app.get("/api/militaryunits/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const militaryUnits = await storage.getUserMilitaryUnits(userId);
      res.json(militaryUnits);
    } catch (error) {
      console.error('Error fetching military units:', error);
      res.status(500).json({ error: 'Failed to fetch military units' });
    }
  });

  app.get("/api/militaryunits/:id", async (req, res) => {
    try {
      const militaryUnit = await storage.getMilitaryUnit(req.params.id);
      if (!militaryUnit) {
        return res.status(404).json({ error: 'Military unit not found' });
      }
      res.json(militaryUnit);
    } catch (error) {
      console.error('Error fetching military unit:', error);
      res.status(500).json({ error: 'Failed to fetch military unit' });
    }
  });

  app.patch("/api/militaryunits/:id", async (req, res) => {
    try {
      const updates = insertMilitaryUnitSchema.partial().parse(req.body);
      const updatedMilitaryUnit = await storage.updateMilitaryUnit(req.params.id, updates);
      res.json(updatedMilitaryUnit);
    } catch (error) {
      console.error('Error updating military unit:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update military unit' });
    }
  });

  app.delete("/api/militaryunits/:id", async (req, res) => {
    try {
      await storage.deleteMilitaryUnit(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting military unit:', error);
      res.status(500).json({ error: 'Failed to delete military unit' });
    }
  });

  // Religions routes
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

  // Languages routes
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

  // Myths routes
  app.post("/api/myths", async (req, res) => {
    try {
      const validatedMyth = insertMythSchema.parse(req.body);
      const savedMyth = await storage.createMyth(validatedMyth);
      res.json(savedMyth);
    } catch (error) {
      console.error('Error saving myth:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save myth' });
    }
  });

  app.get("/api/myths/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const myths = await storage.getUserMyths(userId);
      res.json(myths);
    } catch (error) {
      console.error('Error fetching myths:', error);
      res.status(500).json({ error: 'Failed to fetch myths' });
    }
  });

  app.get("/api/myths/:id", async (req, res) => {
    try {
      const myth = await storage.getMyth(req.params.id);
      if (!myth) {
        return res.status(404).json({ error: 'Myth not found' });
      }
      res.json(myth);
    } catch (error) {
      console.error('Error fetching myth:', error);
      res.status(500).json({ error: 'Failed to fetch myth' });
    }
  });

  app.patch("/api/myths/:id", async (req, res) => {
    try {
      const updates = insertMythSchema.partial().parse(req.body);
      const updatedMyth = await storage.updateMyth(req.params.id, updates);
      res.json(updatedMyth);
    } catch (error) {
      console.error('Error updating myth:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update myth' });
    }
  });

  app.delete("/api/myths/:id", async (req, res) => {
    try {
      await storage.deleteMyth(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting myth:', error);
      res.status(500).json({ error: 'Failed to delete myth' });
    }
  });

  // Legends routes
  app.post("/api/legends", async (req, res) => {
    try {
      const validatedLegend = insertLegendSchema.parse(req.body);
      const savedLegend = await storage.createLegend(validatedLegend);
      res.json(savedLegend);
    } catch (error) {
      console.error('Error saving legend:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save legend' });
    }
  });

  app.get("/api/legends/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const legends = await storage.getUserLegends(userId);
      res.json(legends);
    } catch (error) {
      console.error('Error fetching legends:', error);
      res.status(500).json({ error: 'Failed to fetch legends' });
    }
  });

  app.get("/api/legends/:id", async (req, res) => {
    try {
      const legend = await storage.getLegend(req.params.id);
      if (!legend) {
        return res.status(404).json({ error: 'Legend not found' });
      }
      res.json(legend);
    } catch (error) {
      console.error('Error fetching legend:', error);
      res.status(500).json({ error: 'Failed to fetch legend' });
    }
  });

  app.patch("/api/legends/:id", async (req, res) => {
    try {
      const updates = insertLegendSchema.partial().parse(req.body);
      const updatedLegend = await storage.updateLegend(req.params.id, updates);
      res.json(updatedLegend);
    } catch (error) {
      console.error('Error updating legend:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update legend' });
    }
  });

  app.delete("/api/legends/:id", async (req, res) => {
    try {
      await storage.deleteLegend(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting legend:', error);
      res.status(500).json({ error: 'Failed to delete legend' });
    }
  });

  // Events routes
  app.post("/api/events", async (req, res) => {
    try {
      const validatedEvent = insertEventSchema.parse(req.body);
      const savedEvent = await storage.createEvent(validatedEvent);
      res.json(savedEvent);
    } catch (error) {
      console.error('Error saving event:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save event' });
    }
  });

  app.get("/api/events/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({ error: 'Failed to fetch event' });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      const updates = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(req.params.id, updates);
      res.json(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update event' });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ error: 'Failed to delete event' });
    }
  });

  // Technologies routes
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

  // Spells routes
  app.post("/api/spells", async (req, res) => {
    try {
      const validatedSpell = insertSpellSchema.parse(req.body);
      const savedSpell = await storage.createSpell(validatedSpell);
      res.json(savedSpell);
    } catch (error) {
      console.error('Error saving spell:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save spell' });
    }
  });

  app.get("/api/spells/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const spells = await storage.getUserSpells(userId);
      res.json(spells);
    } catch (error) {
      console.error('Error fetching spells:', error);
      res.status(500).json({ error: 'Failed to fetch spells' });
    }
  });

  app.get("/api/spells/:id", async (req, res) => {
    try {
      const spell = await storage.getSpell(req.params.id);
      if (!spell) {
        return res.status(404).json({ error: 'Spell not found' });
      }
      res.json(spell);
    } catch (error) {
      console.error('Error fetching spell:', error);
      res.status(500).json({ error: 'Failed to fetch spell' });
    }
  });

  app.patch("/api/spells/:id", async (req, res) => {
    try {
      const updates = insertSpellSchema.partial().parse(req.body);
      const updatedSpell = await storage.updateSpell(req.params.id, updates);
      res.json(updatedSpell);
    } catch (error) {
      console.error('Error updating spell:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update spell' });
    }
  });

  app.delete("/api/spells/:id", async (req, res) => {
    try {
      await storage.deleteSpell(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting spell:', error);
      res.status(500).json({ error: 'Failed to delete spell' });
    }
  });

  // Resources routes
  app.post("/api/resources", async (req, res) => {
    try {
      const validatedResource = insertResourceSchema.parse(req.body);
      const savedResource = await storage.createResource(validatedResource);
      res.json(savedResource);
    } catch (error) {
      console.error('Error saving resource:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save resource' });
    }
  });

  app.get("/api/resources/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const resources = await storage.getUserResources(userId);
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  });

  app.get("/api/resources/:id", async (req, res) => {
    try {
      const resource = await storage.getResource(req.params.id);
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      res.json(resource);
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ error: 'Failed to fetch resource' });
    }
  });

  app.patch("/api/resources/:id", async (req, res) => {
    try {
      const updates = insertResourceSchema.partial().parse(req.body);
      const updatedResource = await storage.updateResource(req.params.id, updates);
      res.json(updatedResource);
    } catch (error) {
      console.error('Error updating resource:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update resource' });
    }
  });

  app.delete("/api/resources/:id", async (req, res) => {
    try {
      await storage.deleteResource(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(500).json({ error: 'Failed to delete resource' });
    }
  });

  // Buildings routes
  app.post("/api/buildings", async (req, res) => {
    try {
      const validatedBuilding = insertBuildingSchema.parse(req.body);
      const savedBuilding = await storage.createBuilding(validatedBuilding);
      res.json(savedBuilding);
    } catch (error) {
      console.error('Error saving building:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save building' });
    }
  });

  app.get("/api/buildings/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const buildings = await storage.getUserBuildings(userId);
      res.json(buildings);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      res.status(500).json({ error: 'Failed to fetch buildings' });
    }
  });

  app.get("/api/buildings/:id", async (req, res) => {
    try {
      const building = await storage.getBuilding(req.params.id);
      if (!building) {
        return res.status(404).json({ error: 'Building not found' });
      }
      res.json(building);
    } catch (error) {
      console.error('Error fetching building:', error);
      res.status(500).json({ error: 'Failed to fetch building' });
    }
  });

  app.patch("/api/buildings/:id", async (req, res) => {
    try {
      const updates = insertBuildingSchema.partial().parse(req.body);
      const updatedBuilding = await storage.updateBuilding(req.params.id, updates);
      res.json(updatedBuilding);
    } catch (error) {
      console.error('Error updating building:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update building' });
    }
  });

  app.delete("/api/buildings/:id", async (req, res) => {
    try {
      await storage.deleteBuilding(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting building:', error);
      res.status(500).json({ error: 'Failed to delete building' });
    }
  });

  // Animals routes
  app.post("/api/animals", async (req, res) => {
    try {
      const validatedAnimal = insertAnimalSchema.parse(req.body);
      const savedAnimal = await storage.createAnimal(validatedAnimal);
      res.json(savedAnimal);
    } catch (error) {
      console.error('Error saving animal:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save animal' });
    }
  });

  app.get("/api/animals/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const animals = await storage.getUserAnimals(userId);
      res.json(animals);
    } catch (error) {
      console.error('Error fetching animals:', error);
      res.status(500).json({ error: 'Failed to fetch animals' });
    }
  });

  app.get("/api/animals/:id", async (req, res) => {
    try {
      const animal = await storage.getAnimal(req.params.id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
      res.json(animal);
    } catch (error) {
      console.error('Error fetching animal:', error);
      res.status(500).json({ error: 'Failed to fetch animal' });
    }
  });

  app.patch("/api/animals/:id", async (req, res) => {
    try {
      const updates = insertAnimalSchema.partial().parse(req.body);
      const updatedAnimal = await storage.updateAnimal(req.params.id, updates);
      res.json(updatedAnimal);
    } catch (error) {
      console.error('Error updating animal:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update animal' });
    }
  });

  app.delete("/api/animals/:id", async (req, res) => {
    try {
      await storage.deleteAnimal(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting animal:', error);
      res.status(500).json({ error: 'Failed to delete animal' });
    }
  });

  // Transportation routes
  app.post("/api/transportation", async (req, res) => {
    try {
      const validatedTransportation = insertTransportationSchema.parse(req.body);
      const savedTransportation = await storage.createTransportation(validatedTransportation);
      res.json(savedTransportation);
    } catch (error) {
      console.error('Error saving transportation:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save transportation' });
    }
  });

  app.get("/api/transportation/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const transportation = await storage.getUserTransportation(userId);
      res.json(transportation);
    } catch (error) {
      console.error('Error fetching transportation:', error);
      res.status(500).json({ error: 'Failed to fetch transportation' });
    }
  });

  app.get("/api/transportation/:id", async (req, res) => {
    try {
      const transportation = await storage.getTransportation(req.params.id);
      if (!transportation) {
        return res.status(404).json({ error: 'Transportation not found' });
      }
      res.json(transportation);
    } catch (error) {
      console.error('Error fetching transportation:', error);
      res.status(500).json({ error: 'Failed to fetch transportation' });
    }
  });

  app.patch("/api/transportation/:id", async (req, res) => {
    try {
      const updates = insertTransportationSchema.partial().parse(req.body);
      const updatedTransportation = await storage.updateTransportation(req.params.id, updates);
      res.json(updatedTransportation);
    } catch (error) {
      console.error('Error updating transportation:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update transportation' });
    }
  });

  app.delete("/api/transportation/:id", async (req, res) => {
    try {
      await storage.deleteTransportation(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting transportation:', error);
      res.status(500).json({ error: 'Failed to delete transportation' });
    }
  });

  // Natural Laws routes
  app.post("/api/naturallaws", async (req, res) => {
    try {
      const validatedNaturalLaw = insertNaturalLawSchema.parse(req.body);
      const savedNaturalLaw = await storage.createNaturalLaw(validatedNaturalLaw);
      res.json(savedNaturalLaw);
    } catch (error) {
      console.error('Error saving natural law:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save natural law' });
    }
  });

  app.get("/api/naturallaws/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const naturalLaws = await storage.getUserNaturalLaws(userId);
      res.json(naturalLaws);
    } catch (error) {
      console.error('Error fetching natural laws:', error);
      res.status(500).json({ error: 'Failed to fetch natural laws' });
    }
  });

  app.get("/api/naturallaws/:id", async (req, res) => {
    try {
      const naturalLaw = await storage.getNaturalLaw(req.params.id);
      if (!naturalLaw) {
        return res.status(404).json({ error: 'Natural law not found' });
      }
      res.json(naturalLaw);
    } catch (error) {
      console.error('Error fetching natural law:', error);
      res.status(500).json({ error: 'Failed to fetch natural law' });
    }
  });

  app.patch("/api/naturallaws/:id", async (req, res) => {
    try {
      const updates = insertNaturalLawSchema.partial().parse(req.body);
      const updatedNaturalLaw = await storage.updateNaturalLaw(req.params.id, updates);
      res.json(updatedNaturalLaw);
    } catch (error) {
      console.error('Error updating natural law:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update natural law' });
    }
  });

  app.delete("/api/naturallaws/:id", async (req, res) => {
    try {
      await storage.deleteNaturalLaw(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting natural law:', error);
      res.status(500).json({ error: 'Failed to delete natural law' });
    }
  });

  // Traditions routes
  app.post("/api/traditions", async (req, res) => {
    try {
      const validatedTradition = insertTraditionSchema.parse(req.body);
      const savedTradition = await storage.createTradition(validatedTradition);
      res.json(savedTradition);
    } catch (error) {
      console.error('Error saving tradition:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save tradition' });
    }
  });

  app.get("/api/traditions/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const traditions = await storage.getUserTraditions(userId);
      res.json(traditions);
    } catch (error) {
      console.error('Error fetching traditions:', error);
      res.status(500).json({ error: 'Failed to fetch traditions' });
    }
  });

  app.get("/api/traditions/:id", async (req, res) => {
    try {
      const tradition = await storage.getTradition(req.params.id);
      if (!tradition) {
        return res.status(404).json({ error: 'Tradition not found' });
      }
      res.json(tradition);
    } catch (error) {
      console.error('Error fetching tradition:', error);
      res.status(500).json({ error: 'Failed to fetch tradition' });
    }
  });

  app.patch("/api/traditions/:id", async (req, res) => {
    try {
      const updates = insertTraditionSchema.partial().parse(req.body);
      const updatedTradition = await storage.updateTradition(req.params.id, updates);
      res.json(updatedTradition);
    } catch (error) {
      console.error('Error updating tradition:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update tradition' });
    }
  });

  app.delete("/api/traditions/:id", async (req, res) => {
    try {
      await storage.deleteTradition(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting tradition:', error);
      res.status(500).json({ error: 'Failed to delete tradition' });
    }
  });

  // Rituals routes
  app.post("/api/rituals", async (req, res) => {
    try {
      const validatedRitual = insertRitualSchema.parse(req.body);
      const savedRitual = await storage.createRitual(validatedRitual);
      res.json(savedRitual);
    } catch (error) {
      console.error('Error saving ritual:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to save ritual' });
    }
  });

  app.get("/api/rituals/user/:userId?", async (req, res) => {
    try {
      const userId = req.params.userId || null;
      const rituals = await storage.getUserRituals(userId);
      res.json(rituals);
    } catch (error) {
      console.error('Error fetching rituals:', error);
      res.status(500).json({ error: 'Failed to fetch rituals' });
    }
  });

  app.get("/api/rituals/:id", async (req, res) => {
    try {
      const ritual = await storage.getRitual(req.params.id);
      if (!ritual) {
        return res.status(404).json({ error: 'Ritual not found' });
      }
      res.json(ritual);
    } catch (error) {
      console.error('Error fetching ritual:', error);
      res.status(500).json({ error: 'Failed to fetch ritual' });
    }
  });

  app.patch("/api/rituals/:id", async (req, res) => {
    try {
      const updates = insertRitualSchema.partial().parse(req.body);
      const updatedRitual = await storage.updateRitual(req.params.id, updates);
      res.json(updatedRitual);
    } catch (error) {
      console.error('Error updating ritual:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to update ritual' });
    }
  });

  app.delete("/api/rituals/:id", async (req, res) => {
    try {
      await storage.deleteRitual(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting ritual:', error);
      res.status(500).json({ error: 'Failed to delete ritual' });
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


function generateRandomPersonalities(count: number): string[] {
  const traits = [
    "Ambitious", "Curious", "Loyal", "Witty", "Mysterious", "Compassionate", "Stubborn", "Creative", "Analytical", "Charismatic",
    "Brave", "Cautious", "Optimistic", "Cynical", "Generous", "Independent", "Patient", "Impulsive", "Wise", "Quirky"
  ];
  return traits.sort(() => Math.random() - 0.5).slice(0, count);
}


function generateCoherentCharacter() {
  const directCharacters = [
    {
      ageMin: 28,
      ageMax: 35,
      profession: "Private Investigator",
      personality: ["Determined", "Distrustful", "Observant"],
      backstory: "A former circus acrobat turned private investigator in their early thirties. After a trapeze accident ended their performing career, they used their specialized knowledge and unique perspective to transition into their current role. They still practice on silk ribbons in their apartment and have an uncanny ability to scale buildings and squeeze through tight spaces. Speaks four languages and has a photographic memory for faces, though they struggle with trust issues stemming from their circus family's abandonment after their accident.",
      coreMotivation: "Driven by a deep need to expose people's authentic selves when they think no one is watching or when the stakes get high. Their circus family's abandonment after their accident taught them that people's true nature emerges in moments of crisis - and they're compelled to seek out and document these moments of truth. This manifests in their investigative work as an almost obsessive focus on catching people in the act of deception, particularly when they're betraying trust for personal gain (like insurance fraud). But it goes deeper than just solving cases - they're unconsciously recreating scenarios where they can witness and prove that people will abandon their principles when it suits them. The tragic irony is that their relentless pursuit of exposing others' character flaws keeps them isolated and prevents them from forming the genuine connections they actually crave. They're simultaneously trying to protect themselves from future abandonment by exposing people's capacity for betrayal, while also punishing themselves by repeatedly confirming their belief that people are fundamentally unreliable. Their acrobatic skills become metaphorical - they're always positioned to observe from above or outside, never truly landing among people where they might be vulnerable to being left behind again.",
      greatestStrength: "Determination",
      fatalFlaw: "Distrust"
    },
    {
      ageMin: 32,
      ageMax: 40,
      profession: "Freelance Security Consultant",
      personality: ["Courageous", "Paranoid", "Tactical"],
      backstory: "A former military sniper turned freelance security consultant in their mid-thirties. When a mission went wrong and they lost their hearing in one ear, they used their specialized knowledge and unique perspective to transition into their current role. They maintain their marksmanship skills at a private range and can read micro-expressions and body language like a book. Speaks three languages and can communicate effectively in sign language, but suffers from hypervigilance and difficulty sleeping in unfamiliar places.",
      coreMotivation: "To prevent civilian casualties by exposing the weapons manufacturer that provided faulty equipment, by leveraging their military contacts and tactical expertise to gather intelligence on corporate corruption. This driving force shapes every major decision they make and influences how they approach both their professional work and personal relationships.",
      greatestStrength: "Courage",
      fatalFlaw: "Paranoia"
    },
    {
      ageMin: 26,
      ageMax: 33,
      profession: "Music Therapist",
      personality: ["Empathetic", "Perfectionist", "Creative"],
      backstory: "A former classical pianist turned music therapist in their late twenties. Following a hand injury that ended their concert career, they used their specialized knowledge and unique perspective to transition into their current role. They continue to compose music in their spare time and have perfect pitch that helps them detect emotional distress in voices. Speaks five languages and can read musical notation from any culture, however they battle perfectionism that stems from their conservatory training and fear of public failure.",
      coreMotivation: "To help trauma survivors find healing through music, especially those who lost their passions to injury, by developing innovative therapy techniques that combine their professional training with personal experience of loss. This driving force shapes every major decision they make and influences how they approach both their professional work and personal relationships.",
      greatestStrength: "Empathy",
      fatalFlaw: "Perfectionism"
    },
    {
      ageMin: 30,
      ageMax: 38,
      profession: "Environmental Consultant",
      personality: ["Intelligent", "Guilt-ridden", "Methodical"],
      backstory: "A former marine biologist turned environmental consultant in their early thirties. After discovering their research was being used to justify harmful industrial practices, they used their specialized knowledge and unique perspective to transition into their current role. They keep detailed field notes on ecosystem changes and can identify environmental damage patterns invisible to others. Is fluent in three languages and can read scientific papers in six different languages, though they're haunted by the knowledge that their early research contributed to environmental destruction.",
      coreMotivation: "To prevent the ecological collapse of marine ecosystems by exposing corporate environmental crimes, by using their scientific expertise to document evidence and their industry connections to access restricted data. This driving force shapes every major decision they make and influences how they approach both their professional work and personal relationships.",
      greatestStrength: "Intelligence",
      fatalFlaw: "Guilt"
    },
    {
      ageMin: 35,
      ageMax: 45,
      profession: "Rural Clinic Doctor",
      personality: ["Compassionate", "Self-doubting", "Thorough"],
      backstory: "A former emergency room surgeon turned rural clinic doctor in their early forties. After a medical malpractice lawsuit destroyed their reputation despite being innocent, they used their specialized knowledge and unique perspective to transition into their current role. They perform complex procedures with steady hands and have an intuitive ability to diagnose rare conditions. Speaks four languages and has memorized medical terminology in seven languages, but struggles with anxiety about making mistakes and second-guesses their medical decisions.",
      coreMotivation: "To prove their innocence by uncovering the real cause of the patient deaths that ruined their career, by secretly investigating medical records and building relationships with former colleagues who might provide evidence. This driving force shapes every major decision they make and influences how they approach both their professional work and personal relationships.",
      greatestStrength: "Compassion",
      fatalFlaw: "Self-doubt"
    },
    {
      ageMin: 29,
      ageMax: 37,
      profession: "Art Authentication Expert",
      personality: ["Detail-oriented", "Ashamed", "Knowledgeable"],
      backstory: "A former art forger turned art authentication expert in their early thirties. Following the revelation that their mentor was running an international art theft ring, they used their specialized knowledge and unique perspective to transition into their current role. They create intricate analyses of artistic techniques and have an encyclopedic knowledge of art history and forgery methods. Speaks six languages fluently and can read historical documents in ancient scripts, however they struggle with impostor syndrome despite their obvious expertise and reformed criminal past.",
      coreMotivation: "To return stolen artworks to their rightful owners and expose the criminal network that exploited their skills, by using their insider knowledge of forgery techniques to identify stolen pieces in private collections. This driving force shapes every major decision they make and influences how they approach both their professional work and personal relationships.",
      greatestStrength: "Attention to detail",
      fatalFlaw: "Shame"
    },
    {
      ageMin: 27,
      ageMax: 34,
      profession: "Strategic Business Consultant",
      personality: ["Strategic", "Obsessive", "Analytical"],
      backstory: "A former competitive chess player turned strategic business consultant in their late twenties. When they discovered match-fixing corruption in professional chess, they used their specialized knowledge and unique perspective to transition into their current role. They analyze complex strategic scenarios and can calculate probability outcomes and long-term consequences. Communicates in four languages and has studied game theory across different cultures, though they battle obsessive tendencies and difficulty accepting when situations can't be controlled.",
      coreMotivation: "To expose corruption in competitive industries by revealing the systematic cheating that destroyed fair play, by applying strategic thinking to investigate fraud patterns and building cases through careful analysis. This driving force shapes every major decision they make and influences how they approach both their professional work and personal relationships.",
      greatestStrength: "Strategic thinking",
      fatalFlaw: "Obsessiveness"
    },
    {
      ageMin: 31,
      ageMax: 39,
      profession: "Documentary Filmmaker",
      personality: ["Charismatic", "Detached", "Investigative"],
      backstory: "A former undercover journalist turned documentary filmmaker in their mid-thirties. Following exposure of their editor's unethical practices and corporate connections, they used their specialized knowledge and unique perspective to transition into their current role. They blend into different social environments seamlessly and have an intuitive ability to gain people's trust. Speaks five languages and can adopt different accents and dialects convincingly, but has difficulty forming genuine relationships after years of maintaining false identities.",
      coreMotivation: "To expose media manipulation and restore public trust in investigative journalism, by creating documentaries that reveal corporate influence on news media and the stories that were suppressed. This driving force shapes every major decision they make and influences how they approach both their professional work and personal relationships.",
      greatestStrength: "Charisma",
      fatalFlaw: "Emotional detachment"
    },
    {
      ageMin: 62,
      ageMax: 72,
      profession: "Antiquarian Bookshop Owner",
      personality: ["Culturally sensitive", "Guilt-ridden", "Scholarly"],
      backstory: "A former archaeologist turned antiquarian bookshop owner in their mid-sixties. After malaria forced their early retirement and a jaguar encounter in Belize cost them their eye, they used their specialized knowledge and unique perspective to transition into their current role. They maintain correspondence with treasure hunters worldwide and have an encyclopedic knowledge of artifact authentication and provenance. Speaks ancient Mayan dialects fluently and can read historical documents in multiple indigenous languages, though they carry profound guilt over spending thirty years in what they now recognize as sanctioned cultural theft.",
      coreMotivation: "Driven by a profound need to return cultural artifacts to where they truly belong. After decades of 'discovering' and removing treasures for Western museums, they understand that they were part of a system that stripped indigenous peoples of their heritage. The jaguar attack that cost them their eye was nature itself rejecting their presence in sacred spaces - earning them the right to become a guardian rather than an exploiter of ancient cultures. This manifests as secretly using their archaeological contacts to track down stolen artifacts for repatriation. Their bookshop becomes both a front for this work and a place to educate people about the cost of cultural appropriation. Every stolen piece they recover and return is an act of justice and personal redemption. They're fighting modern-day tomb raiders while battling the legacy of their own profession's colonial mindset. Undoing decades of institutional harm drives them to work in secrecy, knowing they can never fully undo what they've taken, but can maybe prevent others from taking more. Their transition from archaeologist to artifact repatriation agent is their attempt to atone for thirty years of well-intentioned but harmful work.",
      greatestStrength: "Cultural sensitivity",
      fatalFlaw: "Guilt"
    }
  ];

  const character = directCharacters[Math.floor(Math.random() * directCharacters.length)];
  const age = Math.floor(Math.random() * (character.ageMax - character.ageMin + 1)) + character.ageMin;

  return {
    age,
    occupation: character.profession,
    personality: character.personality,
    backstory: character.backstory,
    motivation: character.coreMotivation,
    strength: character.greatestStrength,
    flaw: character.fatalFlaw
  };
}

function generateRandomSetup(): string {
  const setups = [
    "A quiet town harbors a dark secret that threatens its very existence",
    "An unlikely hero discovers they possess extraordinary abilities",
    "Two rival families are forced to work together against a common enemy",
    "A mysterious artifact resurfaces after centuries of being lost",
    "A young person inherits more than they bargained for",
    "Strange phenomena begin occurring around the world simultaneously"
  ];
  return setups[Math.floor(Math.random() * setups.length)];
}

function generateRandomTheme(): string {
  const themes = [
    "The power of forgiveness and redemption",
    "Finding strength in vulnerability",
    "The cost of ambition and power",
    "Love conquers all obstacles",
    "Truth will always surface",
    "Growth comes through adversity",
    "The importance of sacrifice for others"
  ];
  return themes[Math.floor(Math.random() * themes.length)];
}

function generateRandomConflict(): string {
  const conflicts = [
    "Person vs. Self - internal struggle with identity and purpose",
    "Person vs. Person - direct confrontation with an antagonist",
    "Person vs. Society - fighting against corrupt systems",
    "Person vs. Nature - survival against natural forces",
    "Person vs. Technology - struggle with artificial intelligence",
    "Person vs. Fate - fighting against predetermined destiny"
  ];
  return conflicts[Math.floor(Math.random() * conflicts.length)];
}

function generateRandomPrompt(genre?: string): string {
  const promptTemplates = {
    fantasy: [
      "A young apprentice discovers their magic teacher has been secretly stealing power from students",
      "In a world where dragons are extinct, someone finds a living egg in their grandmother's attic",
      "The kingdom's most powerful wizard loses their magic on the day they need it most",
      "Ancient gods return to find the modern world has forgotten them entirely"
    ],
    'sci-fi': [
      "Earth receives a message from space, but it's from humans who left centuries ago",
      "A time traveler keeps trying to prevent a disaster, but each attempt makes it worse",
      "The last human on Earth discovers they're not alone after all",
      "An AI designed to help humanity decides the best way is to control it completely"
    ],
    romance: [
      "Two rival coffee shop owners are forced to work together when their buildings merge",
      "A wedding planner falls in love with someone who's sworn off marriage forever",
      "Love letters meant for someone else keep appearing in your mailbox",
      "Two people keep meeting in different time periods throughout history"
    ],
    mystery: [
      "A detective realizes the serial killer they're hunting is someone they know personally",
      "Everyone in town claims to have an alibi for the same exact time",
      "A murder victim keeps leaving clues from beyond the grave",
      "The same crime keeps happening in different cities, decades apart"
    ],
    thriller: [
      "You wake up in a room with no memory and a countdown timer showing 24 hours",
      "Your identical twin, who died years ago, appears at your door",
      "Every night at midnight, you receive a call from your own phone number",
      "A passenger on your flight whispers that the plane will never land"
    ],
    contemporary: [
      "A social media influencer discovers their entire online life has been fabricated",
      "Two strangers get stuck in an elevator and realize they've ruined each other's lives",
      "A person inherits a house and finds diary entries that predict their future",
      "Everyone in your city starts receiving the same recurring dream"
    ]
  };

  const selectedGenre = genre || 'contemporary';
  const templates = promptTemplates[selectedGenre as keyof typeof promptTemplates] || promptTemplates.contemporary;
  return templates[Math.floor(Math.random() * templates.length)];
}

function getRandomGenre(): string {
  const genres = ['fantasy', 'sci-fi', 'romance', 'mystery', 'thriller', 'contemporary'];
  return genres[Math.floor(Math.random() * genres.length)];
}

function getRandomDifficulty(): string {
  const difficulties = ['Easy', 'Medium', 'Hard'];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

function getRandomPromptType(): string {
  const types = ['Story Starter', 'Character Focus', 'Dialogue', 'Setting', 'Conflict'];
  return types[Math.floor(Math.random() * types.length)];
}

function getRandomWordCount(): string {
  const wordCounts = ['500-1000 words', '1000-2500 words', '2500-5000 words', '5000+ words'];
  return wordCounts[Math.floor(Math.random() * wordCounts.length)];
}

// Setting generator helper functions
function generateRandomSettingName(): string {
  const prefixes = ['Ancient', 'Crystal', 'Shadow', 'Golden', 'Emerald', 'Silver', 'Crimson', 'Mystic', 'Fallen', 'Lost'];
  const suffixes = ['Haven', 'Peaks', 'Falls', 'Harbor', 'Glen', 'Ridge', 'Vale', 'Reach', 'Hollow', 'Crossing'];
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

function generateRandomLocation(): string {
  const locations = [
    'Remote mountain village', 'Coastal fishing town', 'Desert oasis', 'Forest clearing',
    'Island settlement', 'Underground cavern city', 'Floating sky city', 'River delta',
    'Canyon stronghold', 'Tundra outpost', 'Jungle temple complex', 'Prairie trading post'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}

function generateRandomTimePeriod(): string {
  const periods = [
    'Medieval era', 'Renaissance period', 'Industrial age', 'Modern day',
    'Near future', 'Distant future', 'Ancient times', 'Post-apocalyptic',
    'Steampunk era', 'Space age', 'Victorian era', 'Wild West'
  ];
  return periods[Math.floor(Math.random() * periods.length)];
}

function generateRandomPopulation(): string {
  const populations = [
    'Small hamlet (50-200)', 'Village (200-1,000)', 'Town (1,000-10,000)',
    'Small city (10,000-50,000)', 'Large city (50,000-500,000)', 'Metropolis (500,000+)',
    'Tiny settlement (10-50)', 'Nomadic group (100-500)', 'Isolated family (3-12)'
  ];
  return populations[Math.floor(Math.random() * populations.length)];
}

function generateRandomClimate(): string {
  const climates = [
    'Temperate', 'Tropical', 'Arid desert', 'Arctic tundra', 'Mediterranean',
    'Subtropical', 'Continental', 'Oceanic', 'Monsoon', 'Alpine', 'Steppe', 'Humid continental'
  ];
  return climates[Math.floor(Math.random() * climates.length)];
}

function generateRandomSettingDescription(): string {
  const descriptions = [
    'A place where old traditions meet new challenges, creating unique tensions and opportunities.',
    'Known for its distinctive architecture and the mysterious phenomena that occur here regularly.',
    'A crossroads of different cultures and peoples, each bringing their own customs and conflicts.',
    'Hidden from the outside world, this location harbors secrets that could change everything.',
    'Once prosperous, now struggling to maintain its former glory while adapting to new realities.',
    'A place of natural beauty marred by ancient conflicts that still echo through the community.',
    'Where the boundaries between the mundane and magical are thinner than anywhere else.',
    'A settlement built around a powerful natural resource that both blesses and curses its inhabitants.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomAtmosphere(): string {
  const atmospheres = [
    'Tense and mysterious, with locals whispering about strange occurrences in the shadows.',
    'Warm and welcoming, though visitors sense undercurrents of ancient rivalries.',
    'Melancholic and nostalgic, as if the place is mourning for better times past.',
    'Vibrant and chaotic, with constant activity and an underlying sense of urgency.',
    'Peaceful on the surface, but with an ominous feeling that something is about to change.',
    'Magical and otherworldly, where the impossible seems commonplace.',
    'Gritty and determined, with residents who have learned to survive against all odds.',
    'Elegant but decaying, like a beautiful flower slowly wilting away.'
  ];
  return atmospheres[Math.floor(Math.random() * atmospheres.length)];
}

function generateRandomCulturalElements(): string[] {
  const elements = [
    'Annual harvest festival', 'Coming-of-age rituals', 'Elder council governance',
    'Artisan craft traditions', 'Storytelling circles', 'Religious ceremonies',
    'Trading partnerships', 'Warrior codes', 'Healing practices', 'Music traditions',
    'Architecture styles', 'Dietary customs', 'Marriage ceremonies', 'Death rites',
    'Seasonal celebrations', 'Language dialects'
  ];
  return elements.sort(() => Math.random() - 0.5).slice(0, 4);
}

function generateRandomNotableFeatures(): string[] {
  const features = [
    'Ancient stone circle with mysterious properties',
    'Natural hot springs believed to have healing powers',
    'Towering lighthouse that guides travelers through dangerous terrain',
    'Underground network of tunnels and chambers',
    'Massive library containing rare and forbidden knowledge',
    'Floating gardens that defy natural laws',
    'Crystal formations that glow with inner light',
    'Ancient battlefield where spirits still roam',
    'Marketplace that attracts traders from distant lands',
    'Observatory for studying celestial movements',
    'Sacred grove where no violence can occur',
    'Natural amphitheater with perfect acoustics'
  ];
  return features.sort(() => Math.random() - 0.5).slice(0, 3);
}

// Name generator helper functions
function generateRandomNames(nameType: string, culture: string, userId: string | null): any[] {
  const nameData = {
    character: {
      english: [
        { name: 'Evelyn Hartwell', meaning: 'Wished for child', origin: 'English' },
        { name: 'Theodore Manning', meaning: 'Gift of God', origin: 'English' },
        { name: 'Violet Ashford', meaning: 'Purple flower', origin: 'English' },
        { name: 'Sebastian Cross', meaning: 'Venerable', origin: 'English' }
      ],
      celtic: [
        { name: 'Aileen MacBride', meaning: 'Light bearer', origin: 'Celtic' },
        { name: 'Cian O\'Sullivan', meaning: 'Ancient one', origin: 'Celtic' },
        { name: 'Niamh Gallagher', meaning: 'Brightness', origin: 'Celtic' },
        { name: 'Declan Murphy', meaning: 'Full of goodness', origin: 'Celtic' }
      ],
      fantasy: [
        { name: 'Zephyria Moonwhisper', meaning: 'West wind speaker', origin: 'Fantasy' },
        { name: 'Thalorin Starweaver', meaning: 'Eternal star worker', origin: 'Fantasy' },
        { name: 'Lyralei Dawnbringer', meaning: 'Song of dawn', origin: 'Fantasy' },
        { name: 'Drakmor Shadowbane', meaning: 'Dragon shadow destroyer', origin: 'Fantasy' }
      ]
    },
    place: {
      english: [
        { name: 'Willowbrook', meaning: 'Stream by the willows', origin: 'English' },
        { name: 'Oakenhaven', meaning: 'Oak tree sanctuary', origin: 'English' },
        { name: 'Thornfield', meaning: 'Field of thorns', origin: 'English' },
        { name: 'Rosemere', meaning: 'Rose lake', origin: 'English' }
      ],
      fantasy: [
        { name: 'Aethermoor', meaning: 'Sky marshland', origin: 'Fantasy' },
        { name: 'Crystalvale', meaning: 'Valley of crystals', origin: 'Fantasy' },
        { name: 'Shadowpeak', meaning: 'Dark mountain top', origin: 'Fantasy' },
        { name: 'Starfall Crossing', meaning: 'Where stars descend', origin: 'Fantasy' }
      ]
    }
  };

  const selectedType = nameType in nameData ? nameType as keyof typeof nameData : 'character';
  const selectedCulture = culture === 'any' ? Object.keys(nameData[selectedType])[0] : culture;
  const typeData = nameData[selectedType];
  const names = (typeData as any)[selectedCulture] || (typeData as any)[Object.keys(typeData)[0]];
  
  return names.slice(0, 5).map((name: { name: string; meaning: string; origin: string }) => ({
    ...name,
    nameType,
    culture: selectedCulture
  }));
}

// Conflict generator helper functions
function generateRandomConflictTitle(): string {
  const titles = [
    'The Betrayal Within', 'Shadows of the Past', 'The Impossible Choice', 'Divided Loyalties',
    'The Price of Power', 'Honor vs. Survival', 'The Weight of Truth', 'Broken Promises',
    'The Last Stand', 'Between Two Worlds', 'The Burden of Legacy', 'Crossing the Line'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateRandomConflictType(): string {
  const types = ['internal', 'external', 'interpersonal', 'societal'];
  return types[Math.floor(Math.random() * types.length)];
}

function generateRandomConflictDescription(): string {
  const descriptions = [
    'A fundamental disagreement about values and priorities that cannot be easily resolved.',
    'Two opposing forces clash over resources, territory, or ideological differences.',
    'A character must choose between competing loyalties, each with valid claims.',
    'Past mistakes come back to haunt the present, creating new complications.',
    'A moral dilemma where there is no clearly right or wrong answer.',
    'External pressures force difficult decisions that test character relationships.',
    'A secret threatens to destroy everything the character has worked to build.',
    'Conflicting desires within the character create internal turmoil and doubt.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomStakes(): string {
  const stakes = [
    'The fate of an entire community hangs in the balance.',
    'A cherished relationship will be permanently damaged or destroyed.',
    'The character\'s deepest held beliefs and values are challenged.',
    'Lives will be lost if the wrong choice is made.',
    'The character\'s identity and sense of self are at risk.',
    'Years of hard work and progress could be undone.',
    'Trust, once broken, may never be repaired.',
    'The character must sacrifice something precious to save what matters most.'
  ];
  return stakes[Math.floor(Math.random() * stakes.length)];
}

function generateRandomObstacles(): string[] {
  const obstacles = [
    'Limited time to make a crucial decision',
    'Lack of complete information about the situation',
    'Conflicting advice from trusted advisors',
    'Physical barriers that prevent direct action',
    'Legal or social constraints that limit options',
    'Emotional baggage that clouds judgment',
    'Powerful enemies working against the character',
    'Unexpected complications that change the rules',
    'Personal fears and insecurities',
    'Competing priorities that demand attention'
  ];
  return obstacles.sort(() => Math.random() - 0.5).slice(0, 3);
}

function generateRandomResolutions(): string[] {
  const resolutions = [
    'Find a creative third option that satisfies multiple parties',
    'Make a sacrifice that demonstrates true character growth',
    'Confront the root cause rather than just the symptoms',
    'Seek help from an unexpected ally or source',
    'Accept responsibility and work to make amends',
    'Choose the greater good over personal desires',
    'Stand firm on principles despite the cost',
    'Forgive past wrongs and focus on the future',
    'Use wisdom gained through experience to find a new path',
    'Transform the conflict into an opportunity for positive change'
  ];
  return resolutions.sort(() => Math.random() - 0.5).slice(0, 3);
}

function generateRandomEmotionalImpact(): string {
  const impacts = [
    'Forces the character to confront their deepest fears and weaknesses.',
    'Creates lasting trauma that will affect future relationships and decisions.',
    'Strengthens resolve and clarifies what truly matters in life.',
    'Leads to profound personal growth and a new understanding of self.',
    'Damages trust and creates lasting suspicion of others\' motives.',
    'Inspires courage and determination to face future challenges.',
    'Creates guilt and regret that must be processed and overcome.',
    'Develops empathy and understanding for others\' struggles.'
  ];
  return impacts[Math.floor(Math.random() * impacts.length)];
}

// Theme generator helper functions
function generateRandomThemeTitle(): string {
  const themes = [
    'The Power of Redemption', 'Identity and Belonging', 'The Cost of Progress',
    'Love vs. Duty', 'The Nature of Sacrifice', 'Truth and Deception',
    'The Burden of Legacy', 'Freedom and Responsibility', 'Justice and Mercy',
    'The Search for Meaning', 'Courage in Adversity', 'The Price of Ambition'
  ];
  return themes[Math.floor(Math.random() * themes.length)];
}

function generateRandomThemeDescription(): string {
  const descriptions = [
    'Explores the complex relationship between individual desires and societal expectations.',
    'Examines how past actions continue to influence present circumstances and future possibilities.',
    'Investigates the tension between maintaining tradition and embracing necessary change.',
    'Delves into the moral complexities of making difficult choices in ambiguous situations.',
    'Questions the true nature of heroism and what it means to do the right thing.',
    'Explores how relationships shape identity and the ways people influence each other.',
    'Examines the consequences of power and the responsibilities that come with it.',
    'Investigates themes of forgiveness, both of others and of oneself.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomCoreMessage(): string {
  const messages = [
    'True strength comes from vulnerability and the courage to be authentic.',
    'The greatest battles are often fought within ourselves.',
    'Love and connection are more powerful than fear and isolation.',
    'Every ending is also a beginning in disguise.',
    'The past informs the present but does not have to define the future.',
    'Sometimes the greatest victory is knowing when to surrender.',
    'Wisdom comes from experience, but understanding comes from reflection.',
    'The journey matters more than the destination.'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateRandomSymbolicElements(): string[] {
  const symbols = [
    'Broken mirrors representing fractured identity',
    'Bridges symbolizing connection and transition',
    'Seeds representing potential and new growth',
    'Storms symbolizing internal conflict and change',
    'Keys representing opportunity and hidden knowledge',
    'Crossroads representing choice and uncertainty',
    'Light and shadow representing moral ambiguity',
    'Circles representing cycles and completion',
    'Doors representing new opportunities',
    'Water representing purification and renewal'
  ];
  return symbols.sort(() => Math.random() - 0.5).slice(0, 4);
}

function generateRandomThematicQuestions(): string[] {
  const questions = [
    'What does it truly mean to be brave?',
    'How do we balance personal desires with responsibilities to others?',
    'Can people really change, or are we bound by our nature?',
    'What price are we willing to pay for our dreams?',
    'How do we forgive the unforgivable?',
    'What makes a life worth living?',
    'How do we find hope in hopeless situations?',
    'What is the difference between justice and revenge?',
    'How do we learn to trust again after betrayal?',
    'What legacy do we want to leave behind?'
  ];
  return questions.sort(() => Math.random() - 0.5).slice(0, 3);
}

function generateRandomThematicConflicts(): string[] {
  const conflicts = [
    'Individual freedom vs. collective responsibility',
    'Loyalty to family vs. personal moral code',
    'Desire for revenge vs. need for healing',
    'Ambition for success vs. maintaining relationships',
    'Following tradition vs. embracing change',
    'Seeking truth vs. preserving peace',
    'Personal safety vs. standing up for others',
    'Accepting fate vs. fighting for control'
  ];
  return conflicts.sort(() => Math.random() - 0.5).slice(0, 3);
}

function generateRandomLiteraryExamples(): string[] {
  const examples = [
    '"To Kill a Mockingbird" - Moral courage in the face of social pressure',
    '"The Great Gatsby" - The corruption of the American Dream',
    '"1984" - The nature of truth and the power of language',
    '"Pride and Prejudice" - The importance of looking beyond first impressions',
    '"The Lord of the Rings" - The struggle between good and evil',
    '"Beloved" - The lasting trauma of historical injustice',
    '"The Kite Runner" - Redemption and the weight of guilt',
    '"Hamlet" - The paralysis of overthinking and moral uncertainty'
  ];
  return examples.sort(() => Math.random() - 0.5).slice(0, 3);
}

// Mood generator helper functions
function generateRandomMoodName(): string {
  const moods = [
    'Twilight Melancholy', 'Dawn\'s Promise', 'Stormy Introspection', 'Peaceful Reflection',
    'Autumn Nostalgia', 'Winter\'s Silence', 'Spring Awakening', 'Summer\'s Embrace',
    'Mysterious Tension', 'Joyful Celebration', 'Quiet Contemplation', 'Passionate Intensity'
  ];
  return moods[Math.floor(Math.random() * moods.length)];
}

function generateRandomMoodDescription(): string {
  const descriptions = [
    'A bittersweet atmosphere that evokes both sadness and hope, perfect for moments of transition.',
    'An energetic and uplifting feeling that encourages action and positive change.',
    'A contemplative mood that invites deep thought and introspection.',
    'A tense and mysterious atmosphere that keeps readers on edge.',
    'A warm and comforting feeling that provides safety and reassurance.',
    'A dramatic and intense mood that heightens emotional stakes.',
    'A peaceful and serene atmosphere that offers respite from conflict.',
    'A playful and light-hearted mood that brings joy and laughter.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

function generateRandomEmotionalTone(): string {
  const tones = [
    'Melancholic', 'Hopeful', 'Tense', 'Peaceful', 'Nostalgic', 'Mysterious',
    'Joyful', 'Contemplative', 'Dramatic', 'Serene', 'Passionate', 'Whimsical'
  ];
  return tones[Math.floor(Math.random() * tones.length)];
}

function generateRandomSensoryDetails(): string[] {
  const details = [
    'The musty scent of old books and parchment',
    'Soft golden light filtering through dusty windows',
    'The distant sound of church bells echoing',
    'Cool marble surfaces under fingertips',
    'The taste of salt spray in the ocean air',
    'Warm bread baking in nearby ovens',
    'Silk curtains rustling in a gentle breeze',
    'The crackle of logs burning in a fireplace',
    'Damp earth after a summer rain',
    'Morning dew glistening on grass blades'
  ];
  return details.sort(() => Math.random() - 0.5).slice(0, 4);
}

function generateRandomColorAssociations(): string[] {
  const colors = [
    'Deep amber', 'Soft silver', 'Rich burgundy', 'Pale gold', 'Dusky rose',
    'Midnight blue', 'Forest green', 'Warm copper', 'Lavender gray', 'Cream white',
    'Charcoal black', 'Sunset orange', 'Sage green', 'Pearl white', 'Crimson red'
  ];
  return colors.sort(() => Math.random() - 0.5).slice(0, 5);
}

function generateRandomWeatherElements(): string[] {
  const weather = [
    'Gentle mist rising from the ground',
    'Dramatic storm clouds gathering overhead',
    'Soft snowflakes falling silently',
    'Warm sunshine breaking through clouds',
    'Light rain pattering on rooftops',
    'Strong winds bending tree branches',
    'Heavy fog obscuring the distance',
    'Clear starry skies overhead',
    'Lightning illuminating the horizon',
    'Rainbow appearing after the storm'
  ];
  return weather.sort(() => Math.random() - 0.5).slice(0, 3);
}

function generateRandomLightingEffects(): string[] {
  const lighting = [
    'Flickering candlelight casting dancing shadows',
    'Harsh fluorescent light creating stark contrasts',
    'Soft lamplight creating a warm glow',
    'Moonlight streaming through windows',
    'Firelight painting everything in orange hues',
    'Sunlight filtered through leaves',
    'Neon signs reflecting in puddles',
    'Starlight providing faint illumination',
    'Dawn light gradually brightening the sky',
    'Dusk shadows growing longer'
  ];
  return lighting.sort(() => Math.random() - 0.5).slice(0, 3);
}

function generateRandomSoundscape(): string[] {
  const sounds = [
    'Distant thunder rumbling low',
    'Birds chirping in nearby trees',
    'Clock ticking steadily in the background',
    'Footsteps echoing in empty hallways',
    'Wind whistling through cracks',
    'Water dripping rhythmically',
    'Voices murmuring in conversation',
    'Papers rustling softly',
    'Doors creaking on old hinges',
    'Music playing faintly from another room'
  ];
  return sounds.sort(() => Math.random() - 0.5).slice(0, 4);
}