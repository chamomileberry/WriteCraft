import { Router } from "express";
import { storage } from "../storage";
import { insertMoodSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/generate", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const generateRequestSchema = z.object({
      genre: z.string().optional(),
      notebookId: z.string().optional(),
    });
    
    const { genre, notebookId } = generateRequestSchema.parse(req.body);
    
    // Validate notebook ownership if provided
    if (notebookId) {
      const ownsNotebook = await storage.validateNotebookOwnership(notebookId, userId);
      if (!ownsNotebook) {
        console.warn(`[Security] Unauthorized notebook access attempt - userId: ${userId}, notebookId: ${notebookId}`);
        return res.status(404).json({ error: 'Notebook not found' });
      }
    }
    
    // Generate mood with realistic data
    const moods = [
      {
        name: "Ethereal Twilight",
        emotionalTone: "Contemplative melancholy tinged with hope",
        description: "A liminal space between day and night where possibilities feel endless yet fleeting",
        sensoryDetails: [
          "Cool evening air raising goosebumps",
          "The last rays of sun warming exposed skin",
          "Dew beginning to settle on grass",
          "The weight of silence broken by distant sounds"
        ],
        colorAssociations: [
          "Deep purples fading into indigo",
          "Burnt orange streaks across the horizon",
          "Silvery blue shadows lengthening",
          "First stars appearing as pinpricks of light"
        ],
        weatherElements: [
          "Gentle breeze carrying evening scents",
          "Clear skies transitioning to twilight",
          "Temperature dropping subtly",
          "Humidity rising with the approaching night"
        ],
        lightingEffects: [
          "Golden hour glow softening edges",
          "Long shadows creating depth",
          "Silhouettes becoming more pronounced",
          "Natural light taking on warmth before fading"
        ],
        soundscape: [
          "Crickets beginning their evening chorus",
          "Distant traffic fading to quiet",
          "Leaves rustling in evening breeze",
          "The day's activities winding down"
        ]
      },
      {
        name: "Storm's Approach",
        emotionalTone: "Anticipation mixed with underlying tension",
        description: "The charged atmosphere before nature unleashes its power",
        sensoryDetails: [
          "Electricity in the air making hair stand on end",
          "Sudden gusts of wind",
          "The scent of rain on the horizon",
          "Pressure changes creating unease"
        ],
        colorAssociations: [
          "Bruised purple and gray clouds",
          "Sickly yellow-green cast to the light",
          "Dark shadows deepening",
          "Flashes of brilliant white lightning"
        ],
        weatherElements: [
          "Wind picking up erratically",
          "Dark clouds rolling in",
          "First fat drops of rain",
          "Thunder rumbling in the distance"
        ],
        lightingEffects: [
          "Dimming natural light",
          "Sudden bright flashes",
          "Dramatic contrast between light and dark",
          "Greenish tint to daylight"
        ],
        soundscape: [
          "Wind howling and whistling",
          "Thunder growing closer",
          "Rain beginning to patter",
          "Objects being blown about"
        ]
      },
      {
        name: "Peaceful Morning",
        emotionalTone: "Serene optimism and gentle awakening",
        description: "The quiet promise of a new day beginning",
        sensoryDetails: [
          "Soft morning light filtering through curtains",
          "Cool, crisp air freshness",
          "The warmth of bedding contrasting with room temperature",
          "Gentle bird calls outside"
        ],
        colorAssociations: [
          "Soft golden sunlight",
          "Pale blue sky",
          "Fresh green of morning dew",
          "Warm cream and white tones"
        ],
        weatherElements: [
          "Clear skies or gentle clouds",
          "Light morning dew",
          "Comfortable temperature",
          "Gentle morning breeze"
        ],
        lightingEffects: [
          "Soft, diffused light",
          "Long, gentle shadows",
          "Warm glow on surfaces",
          "Natural light revealing details"
        ],
        soundscape: [
          "Birds singing their morning songs",
          "Distant sounds of the world waking",
          "Gentle rustling of leaves",
          "Quiet peace before the day begins"
        ]
      }
    ];
    
    // Select a random mood
    const selectedMood = moods[Math.floor(Math.random() * moods.length)];
    
    const mood = {
      ...selectedMood,
      notebookId: notebookId || null,
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

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

router.get("/user/:userId?", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const moods = await storage.getUserMoods(userId, notebookId);
    res.json(moods);
  } catch (error) {
    console.error('Error fetching moods:', error);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

router.get("/:id", async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const notebookId = req.query.notebookId as string;
    
    if (!notebookId) {
      return res.status(400).json({ error: 'notebookId query parameter is required' });
    }
    
    const mood = await storage.getMood(req.params.id, userId, notebookId);
    if (!mood) {
      return res.status(404).json({ error: 'Mood not found' });
    }
    res.json(mood);
  } catch (error) {
    console.error('Error fetching mood:', error);
    res.status(500).json({ error: 'Failed to fetch mood' });
  }
});

export default router;
