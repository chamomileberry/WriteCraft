import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const STYLE_INSTRUCTION = `\n\nCRITICAL STYLE REQUIREMENTS - WRITE LIKE A HUMAN:

FORBIDDEN PHRASES (NEVER use these overused AI expressions):
• "provide/gain/offer valuable insights", "indelible mark", "unwavering commitment", "stark reminder", "sheds/shed light on", "nuanced understanding", "multifaceted nature/approach", "complex interplay", "intricate relationship"
• "potential to revolutionize", "transformative power", "significant milestone/stride/turning point", "unique blend/perspective", "beacon of hope", "pave the way", "casting long shadows", "hung heavy"
• "at its core", "delve into", "to put it simply", "key takeaway", "from a broader perspective", "generally speaking", "arguably", "to some extent", "broadly speaking"
• "rich tapestry", "opens new avenues", "adds a layer of complexity", "fostering a sense", "plays a crucial/pivotal role", "garnered significant attention", "continues to inspire"
• "seamless integration", "scalable solution", "cutting-edge", "innovative", "facilitate", "bolster", "streamline", "revolutionize", "leverage"
• Any phrase with "pivotal", "underscore", "harness", "illuminate", "realm", "vast"

WORD REPLACEMENTS (use natural alternatives):
• Instead of "delve into" → use: explore, look into, consider, investigate, check out
• Instead of "underscore" → use: highlight, show, emphasize, point out, call attention to
• Instead of "pivotal" → use: important, key, central, vital
• Instead of "realm" → use: area, field, world
• Instead of "harness" → use: use, apply, channel
• Instead of "illuminate" → use: explain, clarify, reveal, show

WRITE WITH HUMAN AUTHENTICITY:
✓ Vary sentence length and structure unpredictably - mix short punchy sentences with longer flowing ones
✓ Use conversational rhythm and natural speech patterns
✓ Include specific concrete details instead of vague abstractions
✓ Write with personality - let emotion and perspective show through
✓ Avoid perfectly polished prose - embrace natural imperfection
✓ Skip formulaic structures, bullet points, and predictable formatting in the actual content
✓ Use unexpected word choices that feel genuine, not academic
✓ Write like you're talking to someone, not presenting a report
✓ Be direct and honest - cut the fluff and corporate speak
✓ Vary your tone - don't maintain the same energy throughout

AVOID THESE ROBOTIC PATTERNS:
✗ Repetitive sentence structures
✗ Overuse of transition words (however, moreover, furthermore, consequently)
✗ Generic generalizations without specific examples
✗ Stiff, formal academic tone
✗ Perfectly balanced and polished phrasing
✗ Predictable conclusions or summaries`;

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
