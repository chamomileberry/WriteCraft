import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Common AI-generated clichés to avoid
const AVOID_PHRASES = [
  'provide a valuable insight', 'left an indelible mark', 'play a significant role in shaping',
  'unwavering commitment', 'open a new avenue', 'stark reminder', 'play a crucial role',
  'crucial role in understanding', 'sheds a light', 'gain a comprehensive understanding',
  'nuanced understanding', 'gain significant attention', 'continue to inspire',
  'provide a comprehensive overview', 'highlight the importance', 'endure a legacy',
  'gain a deeper understanding', 'multifaceted nature', 'complex interplay', 'navigate the complex',
  'shed a light on', 'need to fully understand', 'potential to revolutionize', 'relentless pursuit',
  'offer a valuable', 'underscore the importance', 'transformative power', 'fast-paced world',
  'significant milestone', 'pose a significant challenge', 'unique blend', 'crucial development',
  'commitment to excellence', 'sent shockwaves through', 'emphasize the need', 'face of adversity',
  'leave a lasting', 'gain a valuable', 'broad implications', 'prominent figure',
  'significant turning point', 'curiosity piques', 'digital age', 'beacon of hope',
  'pave the way', 'meticulous attention to', 'add a layer', 'legacy of', 'aim to explore',
  'highlight the need', 'multifaceted approach', 'provide a framework', 'present a unique challenge',
  'highlight the significance', 'add depth to', 'significant stride', 'gain an insight',
  'underscore the need', 'offer a unique perspective', 'contribute to understanding',
  'significant implication', 'enhances the understanding', 'make an informed decision',
  'careful consideration', 'essential to recognize', 'vital role in shaping', 'sense of camaraderie',
  'unwavering support', 'significant step forward', 'add an extra layer', 'profound implication'
];

const STYLE_INSTRUCTION = `\n\nIMPORTANT STYLE GUIDELINES:
- Write naturally and authentically
- Avoid clichéd phrases and overused expressions
- Use fresh, specific language instead of generic phrases
- Be direct and genuine in your expression`;

router.post("/improve-text", async (req: any, res) => {
  try {
    const { text, action, customPrompt } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    let prompt = '';

    switch (action) {
      case 'improve':
        prompt = `Improve the following text by making it clearer, more engaging, and better written while preserving the original meaning. Return ONLY the improved text without any explanations or commentary.${STYLE_INSTRUCTION}

${text}`;
        break;

      case 'shorten':
        prompt = `Make the following text more concise while preserving its key points and meaning. Return ONLY the shortened text without any explanations or commentary.${STYLE_INSTRUCTION}

${text}`;
        break;

      case 'expand':
        prompt = `Expand the following text with more details, examples, or elaboration while maintaining its style and tone. Return ONLY the expanded text without any explanations or commentary.${STYLE_INSTRUCTION}

${text}`;
        break;

      case 'fix':
        prompt = `Fix any grammar, spelling, or punctuation errors in the following text. Return ONLY the corrected text without any explanations or commentary.${STYLE_INSTRUCTION}

${text}`;
        break;

      case 'ask':
        if (customPrompt) {
          prompt = `You are a creative writing assistant. The user has selected the following text and wants you to help with a specific task.

SELECTED TEXT:
${text}

USER'S INSTRUCTION:
${customPrompt}

Follow the user's instruction and return ONLY the modified text without any explanations or commentary.${STYLE_INSTRUCTION}`;
        } else {
          prompt = `You are a creative writing assistant. The user has selected this text and wants your help with it. Provide a brief, helpful suggestion or improvement. Be concise.${STYLE_INSTRUCTION}

${text}`;
        }
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
