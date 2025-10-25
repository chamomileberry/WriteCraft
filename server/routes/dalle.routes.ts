import { Router } from "express";
import Replicate from "replicate";
import { z } from "zod";
import { ObjectStorageService } from "../objectStorage";
import { setObjectAclPolicy } from "../objectAcl";

const router = Router();

// Validate API token is configured - fail fast on startup
if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("[Ideogram] REPLICATE_API_TOKEN environment variable is not set - cannot initialize Replicate client");
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const generateImageSchema = z.object({
  prompt: z.string().min(1).max(4000),
  quality: z.enum(["standard", "hd"]).default("standard"),
  size: z.enum(["1024x1024", "1024x1792", "1792x1024"]).default("1024x1024"),
});

// Map size and quality to resolution for Ideogram
function sizeAndQualityToResolution(size: string, quality: string): string {
  const isHD = quality === "hd";
  
  const mapping: Record<string, { standard: string; hd: string }> = {
    "1024x1024": { 
      standard: "1024x1024",
      hd: "1024x1024"
    },
    "1024x1792": { 
      standard: "640x1152",
      hd: "768x1344"
    },
    "1792x1024": { 
      standard: "1152x640",
      hd: "1536x640"
    },
  };
  
  const resolution = mapping[size];
  return isHD ? resolution.hd : resolution.standard;
}

// Map size to aspect ratio for Ideogram
function sizeToAspectRatio(size: string): string {
  const mapping: Record<string, string> = {
    "1024x1024": "1:1",
    "1024x1792": "9:16",
    "1792x1024": "16:9",
  };
  return mapping[size] || "1:1";
}

router.post("/generate", async (req: any, res) => {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return res.status(500).json({
        error: "Image generation service is not configured. Please contact support."
      });
    }

    const validated = generateImageSchema.parse(req.body);
    const userId = req.user.claims.sub;

    console.log("[Ideogram] Generating image with prompt:", validated.prompt);

    // Generate image with Ideogram V3 Turbo - this streams raw image bytes
    let output = await replicate.run(
      "ideogram-ai/ideogram-v3-turbo",
      {
        input: {
          prompt: validated.prompt,
          aspect_ratio: sizeToAspectRatio(validated.size),
          resolution: sizeAndQualityToResolution(validated.size, validated.quality),
          style_type: "Auto",
          magic_prompt_option: "Auto",
        }
      }
    ) as any;

    console.log("[Ideogram] Output type:", typeof output, "has getReader:", 'getReader' in (output || {}), "has asyncIterator:", Symbol.asyncIterator in (output || {}));

    // Handle streaming response - Replicate streams raw image bytes
    let imageBuffer: Buffer;
    
    if (output && typeof output === 'object' && 'getReader' in output) {
      // ReadableStream - collect binary chunks
      console.log("[Ideogram] Output is a ReadableStream, collecting image bytes...");
      const reader = output.getReader();
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // Calculate total length and concatenate
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      imageBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
      console.log("[Ideogram] Image stream collected, size:", imageBuffer.length, "bytes");
    }
    else if (output && typeof output === 'object' && Symbol.asyncIterator in output) {
      // Async iterable - collect binary chunks
      console.log("[Ideogram] Output is an async iterable, collecting image bytes...");
      const chunks: Buffer[] = [];
      
      for await (const chunk of output as any) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      
      imageBuffer = Buffer.concat(chunks);
      console.log("[Ideogram] Image stream collected, size:", imageBuffer.length, "bytes");
    }
    else {
      // Not a stream - this shouldn't happen with Ideogram but handle it
      console.error("[Ideogram] Unexpected output format (not a stream):", typeof output);
      return res.status(500).json({ 
        error: "Unexpected response format from image generation service" 
      });
    }

    // Validate we got image data
    if (!imageBuffer || imageBuffer.length === 0) {
      console.error("[Ideogram] No image data received");
      return res.status(500).json({ 
        error: "No image data received from generation service" 
      });
    }

    // Detect content type from magic bytes
    let contentType = 'image/webp'; // default
    if (imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8) {
      contentType = 'image/jpeg';
    } else if (imageBuffer[0] === 0x89 && imageBuffer[1] === 0x50) {
      contentType = 'image/png';
    } else if (imageBuffer[0] === 0x52 && imageBuffer[1] === 0x49) {
      contentType = 'image/webp';
    }

    console.log("[Ideogram] Image received, size:", imageBuffer.length, "bytes, type:", contentType);

    // Get upload URL from object storage
    const objectStorageService = new ObjectStorageService();
    const { uploadURL, objectId } = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = `/objects/uploads/${objectId}`;

    console.log("[Ideogram] Uploading to object storage:", objectPath);

    // Upload to object storage
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

    // Set ACL policy for the uploaded image
    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
    await setObjectAclPolicy(objectFile, {
      owner: userId,
      visibility: "private",
      aclRules: [],
    });

    console.log("[Ideogram] Image successfully saved to:", objectPath);

    res.json({
      imageUrl: objectPath,
      revisedPrompt: undefined, // Ideogram doesn't provide this when streaming
    });
  } catch (error: any) {
    console.error("[Ideogram] Generation error:", error);
    
    if (error.name === "ZodError") {
      return res.status(400).json({ 
        error: "Invalid request parameters",
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to generate image" 
    });
  }
});

export default router;
