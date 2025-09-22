import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCharacterSchema, 
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
  insertPlantSchema
} from "@shared/schema";
import { z } from "zod";
import { generateCharacterWithAI, generateSettingWithAI, generateCreatureWithAI, generatePlantWithAI, generatePromptWithAI } from "./ai-generation";

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