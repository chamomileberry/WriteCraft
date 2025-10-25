import { Router } from "express";
import { z } from "zod";
import axios from "axios";

const router = Router();

const stockSearchSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().min(1).max(20).default(12),
});

// Pexels API access - fail fast on startup if not configured
if (!process.env.PEXELS_API_KEY) {
  throw new Error("[StockImages] PEXELS_API_KEY environment variable is not set - cannot initialize stock image service");
}

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

router.post("/search", async (req: any, res) => {
  try {
    const validated = stockSearchSchema.parse(req.body);

    console.log("[StockImages] Searching for:", validated.query);

    if (!PEXELS_API_KEY) {
      return res.status(500).json({ 
        error: "Pexels API key not configured" 
      });
    }

    // Use Pexels API for stock images
    const response = await axios.get('https://api.pexels.com/v1/search', {
      params: {
        query: validated.query,
        per_page: validated.limit,
      },
      headers: {
        'Authorization': PEXELS_API_KEY,
      },
    });

    const images = response.data.photos.map((photo: any) => ({
      url: photo.src.large,
      alt: photo.alt || validated.query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    }));

    res.json({
      images,
      query: validated.query,
    });
  } catch (error: any) {
    console.error("[StockImages] Search error:", error);
    
    if (error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Invalid request parameters",
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to search stock images" 
    });
  }
});

export default router;
