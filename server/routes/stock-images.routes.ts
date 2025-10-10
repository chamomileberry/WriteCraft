import { Router } from "express";
import { z } from "zod";

const router = Router();

const stockSearchSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().min(1).max(20).default(12),
});

router.post("/search", async (req: any, res) => {
  try {
    const validated = stockSearchSchema.parse(req.body);

    console.log("[StockImages] Searching for:", validated.query);

    // This will be handled by the stock_image_tool from the Replit environment
    // The tool downloads images to attached_assets/stock_images directory
    // For now, we'll return a placeholder response that the frontend can use
    
    // In a real implementation, the stock_image_tool would be called here
    // and it would download images to the attached_assets directory
    // Then we'd return the URLs to those downloaded images
    
    // Placeholder response - in production this would use the actual stock_image_tool
    const images = [
      {
        url: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80`,
        alt: validated.query,
      },
    ];

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
