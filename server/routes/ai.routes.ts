import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post("/improve-text", async (req, res) => {
  try {
    const { text, action } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    let prompt = '';

    switch (action) {
      case 'improve':
        prompt = `Improve the following text by making it clearer, more engaging, and better written while preserving the original meaning. Return ONLY the improved text without any explanations or commentary:

${text}`;
        break;

      case 'shorten':
        prompt = `Make the following text more concise while preserving its key points and meaning. Return ONLY the shortened text without any explanations or commentary:

${text}`;
        break;

      case 'expand':
        prompt = `Expand the following text with more details, examples, or elaboration while maintaining its style and tone. Return ONLY the expanded text without any explanations or commentary:

${text}`;
        break;

      case 'fix':
        prompt = `Fix any grammar, spelling, or punctuation errors in the following text. Return ONLY the corrected text without any explanations or commentary:

${text}`;
        break;

      case 'ask':
        prompt = `You are a creative writing assistant. The user has selected this text and wants your help with it. Provide a brief, helpful suggestion or improvement. Be concise:

${text}`;
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const suggestedText = message.content[0].type === 'text' 
      ? message.content[0].text.trim()
      : text;

    res.json({ suggestedText });

  } catch (error) {
    console.error('Error in AI text improvement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: `Failed to improve text: ${errorMessage}` });
  }
});

export default router;
