import { Router } from "express";
import { z } from "zod";
import axios from "axios";

const router = Router();

const stockSearchSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().min(1).max(20).default(12),
});

// Unsplash API access
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'demo';

router.post("/search", async (req: any, res) => {
  try {
    const validated = stockSearchSchema.parse(req.body);

    console.log("[StockImages] Searching for:", validated.query);

    // Use Unsplash API for stock images
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: validated.query,
        per_page: validated.limit,
        client_id: UNSPLASH_ACCESS_KEY,
      },
    });

    const images = response.data.results.map((photo: any) => ({
      url: photo.urls.regular,
      alt: photo.alt_description || validated.query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
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
