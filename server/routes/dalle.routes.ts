import { Router } from "express";
import Replicate from "replicate";
import { z } from "zod";
import { ObjectStorageService } from "../objectStorage";
import { setObjectAclPolicy } from "../objectAcl";

const router = Router();

// Validate API token is configured
if (!process.env.REPLICATE_API_TOKEN) {
  console.error("[Ideogram] REPLICATE_API_TOKEN environment variable is not set");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

const generateImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  quality: z.enum(["standard", "hd"]).default("standard"),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).default("1024x1024"),
});

// Map size to aspect ratio for Ideogram
function sizeToAspectRatio(size: string): string {
  const mapping: Record<string, string> = {
    "1024x1024": "1:1",     // Square
    "1024x1792": "9:16",    // Portrait
    "1792x1024": "16:9",    // Landscape
  };
  return mapping[size] || "1:1";
}

// Map quality to resolution for Ideogram
function qualityToResolution(quality: string): string {
  return quality === "hd" ? "RESOLUTION_1024" : "RESOLUTION_512";
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
    const userId = (req as any).session?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    console.log("[Ideogram] Generating image with prompt:", validated.prompt);

    // Generate image with Ideogram V3 Turbo
    const output = await replicate.run(
      "ideogram-ai/ideogram-v3-turbo",
      {
        input: {
          prompt: validated.prompt,
          aspect_ratio: sizeToAspectRatio(validated.size),
          resolution: qualityToResolution(validated.quality),
          style_type: "Auto",
          magic_prompt_option: "Auto",
        }
      }
    ) as any;

    // Extract the image URL from the output
    // Ideogram returns an array of objects with structure: { url: string, revised_prompt?: string }
    let tempImageUrl: string;
    let revisedPrompt: string | undefined;
    
    if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0];
      if (typeof firstOutput === "object" && firstOutput !== null) {
        // Ideogram V3 Turbo returns objects with url property
        tempImageUrl = firstOutput.url || firstOutput.image_url;
        revisedPrompt = firstOutput.revised_prompt;
      } else if (typeof firstOutput === "string") {
        // Fallback for string URLs
        tempImageUrl = firstOutput;
      } else {
        console.error("[Ideogram] Unexpected output format:", output);
        return res.status(500).json({ 
          error: "Failed to generate image: unexpected response format" 
        });
      }
    } else if (typeof output === "string") {
      tempImageUrl = output;
    } else {
      console.error("[Ideogram] Unexpected output format:", output);
      return res.status(500).json({ 
        error: "Failed to generate image: unexpected response format" 
      });
    }

    // Validate the temporary URL
    if (!tempImageUrl || typeof tempImageUrl !== "string" || !tempImageUrl.startsWith("http")) {
      console.error("[Ideogram] Invalid image URL:", tempImageUrl);
      return res.status(500).json({ 
        error: "Failed to generate image: invalid URL" 
      });
    }

    console.log("[Ideogram] Image generated, downloading from:", tempImageUrl);

    // Download the image from Replicate
    const imageResponse = await fetch(tempImageUrl);
    if (!imageResponse.ok) {
      console.error("[Ideogram] Failed to download image:", imageResponse.status);
      return res.status(500).json({ 
        error: "Failed to download generated image" 
      });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const contentType = imageResponse.headers.get('content-type') || 'image/webp';
    console.log("[Ideogram] Image downloaded, size:", imageBuffer.length, "bytes, type:", contentType);

    // Get upload URL from object storage
    const objectStorageService = new ObjectStorageService();
    const { uploadURL, objectId } = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = `/objects/uploads/${objectId}`;

    console.log("[Ideogram] Uploading to object storage:", objectPath);

    // Upload to object storage with original content type
    const uploadResponse = await fetch(uploadURL, {
      method: 'PUT',
      body: imageBuffer,
      headers: {
        'Content-Type': contentType,
      }
    });

    if (!uploadResponse.ok) {
      console.error("[Ideogram] Failed to upload to storage:", uploadResponse.status);
      return res.status(500).json({ 
        error: "Failed to save generated image" 
      });
    }

    // Set ACL policy for the uploaded image using the storage path
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    await setObjectAclPolicy(objectFile, {
      owner: userId,
      visibility: "private",
      aclRules: [],
    });

    console.log("[Ideogram] Image successfully saved to:", objectPath);

    res.json({
      imageUrl: objectPath,
      revisedPrompt: revisedPrompt,
    });
  } catch (error: any) {
    console.error("[Ideogram] Generation error:", error);
    
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
