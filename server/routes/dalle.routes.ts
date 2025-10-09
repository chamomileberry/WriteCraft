import { Router } from "express";
import Replicate from "replicate";
import { z } from "zod";

const router = Router();

// Validate API token is configured
if (!process.env.REPLICATE_API_TOKEN) {
  console.error("[Flux] REPLICATE_API_TOKEN environment variable is not set");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

const generateImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  quality: z.enum(["standard", "hd"]).default("standard"),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).default("1024x1024"),
});

// Map size to aspect ratio for Flux
function sizeToAspectRatio(size: string): string {
  const mapping: Record<string, string> = {
    "1024x1024": "1:1",    // Square
    "1024x1792": "9:16",   // Portrait
    "1792x1024": "16:9",   // Landscape
  };
  return mapping[size] || "1:1";
}

// Map quality to output quality (0-100)
function qualityToOutputQuality(quality: string): number {
  return quality === "hd" ? 95 : 80;
}

router.post("/generate", async (req, res) => {
  try {
    // Check if API token is configured
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({
        error: "Image generation service is not configured. Please contact support."
      });
    }

    const validated = generateImageSchema.parse(req.body);

    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: validated.prompt,
          aspect_ratio: sizeToAspectRatio(validated.size),
          output_format: "webp",
          output_quality: qualityToOutputQuality(validated.quality),
        }
      }
    );

    // Flux can return: a string URL, an array of URLs, or an async iterator (ReadableStream)
    // Extract the first valid URL
    let imageUrl: string;
    
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (typeof output === "string") {
      imageUrl = output;
    } else if (output && typeof output === "object" && Symbol.asyncIterator in output) {
      // Handle async iterator (ReadableStream)
      const items: string[] = [];
      for await (const item of output as AsyncIterable<any>) {
        items.push(item);
      }
      if (items.length === 0) {
        console.error("[Flux] Empty stream response");
        return res.status(500).json({ 
          error: "Failed to generate image: empty response" 
        });
      }
      imageUrl = items[0];
    } else {
      console.error("[Flux] Unexpected output format:", output);
      return res.status(500).json({ 
        error: "Failed to generate image: unexpected response format" 
      });
    }

    // Validate the URL
    if (!imageUrl || !imageUrl.startsWith("http")) {
      console.error("[Flux] Invalid image URL:", imageUrl);
      return res.status(500).json({ 
        error: "Failed to generate image: invalid URL" 
      });
    }

    res.json({
      imageUrl: imageUrl,
      revisedPrompt: undefined, // Flux doesn't provide revised prompts like DALL-E
    });
  } catch (error: any) {
    console.error("[Flux] Generation error:", error);
    
    if (error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Invalid request parameters",
        details: error.errors 
      });
    }

    if (error.message?.includes("Incorrect API key")) {
      return res.status(500).json({ 
        error: "API key configuration error" 
      });
    }

    if (error.message?.includes("rate limit")) {
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
