import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  quality: z.enum(["standard", "hd"]).default("standard"),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).default("1024x1024"),
});

router.post("/generate", async (req, res) => {
  try {
    const validated = generateImageSchema.parse(req.body);

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: validated.prompt,
      n: 1,
      quality: validated.quality,
      size: validated.size,
      response_format: "url",
    });

    const imageData = response.data?.[0];
    
    if (!imageData?.url) {
      return res.status(500).json({ 
        error: "Failed to generate image" 
      });
    }

    res.json({
      imageUrl: imageData.url,
      revisedPrompt: imageData.revised_prompt,
    });
  } catch (error: any) {
    console.error("[DALL-E] Generation error:", error);
    
    if (error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Invalid request parameters",
        details: error.errors 
      });
    }

    if (error.status === 400) {
      return res.status(400).json({ 
        error: error.message || "Bad request to OpenAI API" 
      });
    }

    if (error.status === 401) {
      return res.status(500).json({ 
        error: "API key configuration error" 
      });
    }

    if (error.status === 429) {
      return res.status(429).json({ 
        error: "Rate limit exceeded. Please try again in a moment." 
      });
    }

    res.status(500).json({ 
      error: "Failed to generate image" 
    });
  }
});

export default router;
