import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCharacterSchema, 
  insertPlotSchema, 
  insertPromptSchema, 
  insertGuideSchema,
  insertSavedItemSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Character generator routes
  app.post("/api/characters/generate", async (req, res) => {
    try {
      const generateRequestSchema = z.object({
        genre: z.string().optional(),
        userId: z.string().nullable().optional()
      });
      
      const { genre, userId } = generateRequestSchema.parse(req.body);
      
      const character = {
        name: generateRandomName(),
        age: Math.floor(Math.random() * 50) + 18,
        occupation: generateRandomOccupation(),
        personality: generateRandomPersonalities(3),
        backstory: generateRandomBackstory(),
        motivation: generateRandomMotivation(),
        flaw: generateRandomTrait(),
        strength: generateRandomTrait(),
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
      res.status(500).json({ error: 'Failed to generate character' });
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
        userId: z.string().nullable().optional()
      });
      
      const { genre, userId } = generateRequestSchema.parse(req.body);
      
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
      
      const prompt = {
        text: generateRandomPrompt(genre),
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

function generateRandomOccupation(): string {
  const occupations = [
    "Librarian", "Detective", "Chef", "Artist", "Engineer", "Teacher", "Doctor", "Writer", "Merchant", "Adventurer",
    "Scientist", "Musician", "Farmer", "Blacksmith", "Scholar", "Pilot", "Archaeologist", "Journalist", "Photographer", "Explorer"
  ];
  return occupations[Math.floor(Math.random() * occupations.length)];
}

function generateRandomPersonalities(count: number): string[] {
  const traits = [
    "Ambitious", "Curious", "Loyal", "Witty", "Mysterious", "Compassionate", "Stubborn", "Creative", "Analytical", "Charismatic",
    "Brave", "Cautious", "Optimistic", "Cynical", "Generous", "Independent", "Patient", "Impulsive", "Wise", "Quirky"
  ];
  return traits.sort(() => Math.random() - 0.5).slice(0, count);
}

function generateRandomBackstory(): string {
  const backstories = [
    "Grew up in a small village and dreams of seeing the world",
    "Lost their family at a young age and was raised by mentors",
    "Discovered a hidden talent that changed their life",
    "Carries a secret that could change everything",
    "Was betrayed by someone they trusted completely",
    "Found an ancient artifact that awakened dormant powers",
    "Escaped from a life of luxury to find their true purpose",
    "Survived a great disaster that shaped their worldview"
  ];
  return backstories[Math.floor(Math.random() * backstories.length)];
}

function generateRandomMotivation(): string {
  const motivations = [
    "To prove their worth to those who doubted them",
    "To find answers about their mysterious past",
    "To protect the people they care about",
    "To discover their true purpose in life",
    "To right a terrible wrong from their past",
    "To master their newfound abilities",
    "To reunite with a lost loved one",
    "To prevent a prophesied catastrophe"
  ];
  return motivations[Math.floor(Math.random() * motivations.length)];
}

function generateRandomTrait(): string {
  const traits = [
    "Determination", "Empathy", "Intelligence", "Courage", "Intuition", "Strength", "Charisma", "Wisdom",
    "Pride", "Fear", "Anger", "Jealousy", "Greed", "Stubbornness", "Impatience", "Insecurity"
  ];
  return traits[Math.floor(Math.random() * traits.length)];
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