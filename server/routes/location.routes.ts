import { Router } from "express";
import { storage } from "../storage";
import { insertLocationSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/generate", async (req, res) => {
  try {
    const generateRequestSchema = z.object({
      locationType: z.string().optional(),
      genre: z.string().optional(),
      userId: z.string().nullable().optional()
    });
    
    const { locationType, genre, userId } = generateRequestSchema.parse(req.body);
    
    // TODO: Extract generator function from main routes.ts file
    const location = {
      name: `Generated ${locationType || 'location'}`,
      description: `A ${genre || 'mysterious'} ${locationType || 'place'} with unique characteristics`,
      locationType: locationType || 'city',
      genre,
      userId: userId || null
    };

    const validatedLocation = insertLocationSchema.parse(location);
    const savedLocation = await storage.createLocation(validatedLocation);
    res.json(savedLocation);
  } catch (error) {
    console.error('Error generating location:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

router.post("/", async (req, res) => {
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

router.get("/user/:userId?", async (req, res) => {
  try {
    const userId = req.params.userId || null;
    const locations = await storage.getUserLocations(userId);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

router.get("/:id", async (req, res) => {
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

export default router;