import { db } from "../db";
import { bannedPhrases } from "@shared/schema";
import { eq } from "drizzle-orm";

interface BannedPhrasesCache {
  timestamp: number;
  instruction: string;
}

// Cache banned phrases for 5 minutes to reduce database queries
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
let cache: BannedPhrasesCache | null = null;

export async function getBannedPhrasesInstruction(): Promise<string> {
  // Check if cache is valid
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.instruction;
  }

  // Load active banned phrases from database
  const phrases = await db
    .select()
    .from(bannedPhrases)
    .where(eq(bannedPhrases.isActive, true));

  // Group phrases by category
  const forbiddenPhrases: string[] = [];
  const bannedTransitions: string[] = [];
  const wordReplacements: Array<{ phrase: string; replacement: string }> = [];
  const roboticPatterns: string[] = [];

  for (const phrase of phrases) {
    switch (phrase.category) {
      case "forbidden_phrase":
        forbiddenPhrases.push(phrase.phrase);
        break;
      case "banned_transition":
        bannedTransitions.push(phrase.phrase);
        break;
      case "word_replacement":
        if (phrase.replacement) {
          wordReplacements.push({
            phrase: phrase.phrase,
            replacement: phrase.replacement,
          });
        }
        break;
      case "robotic_pattern":
        roboticPatterns.push(phrase.phrase);
        break;
    }
  }

  // Format the instruction
  let instruction = "\n\nCRITICAL STYLE REQUIREMENTS - WRITE LIKE A HUMAN:\n\n";

  // Forbidden phrases section
  if (forbiddenPhrases.length > 0) {
    instruction +=
      "ABSOLUTELY FORBIDDEN PHRASES AND WORDS (NEVER use any of these):\n";
    // Group forbidden phrases into chunks for readability
    const chunkSize = 10;
    for (let i = 0; i < forbiddenPhrases.length; i += chunkSize) {
      const chunk = forbiddenPhrases.slice(i, i + chunkSize);
      instruction += "• " + chunk.map((p) => `"${p}"`).join(", ") + "\n";
    }
    instruction += "\n";
  }

  // Banned transitions section
  if (bannedTransitions.length > 0) {
    instruction += "BANNED TRANSITION WORDS (avoid overusing these):\n";
    instruction += "• " + bannedTransitions.join(", ") + "\n\n";
  }

  // Word replacements section
  if (wordReplacements.length > 0) {
    instruction += "WORD REPLACEMENTS (use natural alternatives):\n";
    for (const { phrase, replacement } of wordReplacements) {
      instruction += `• Instead of "${phrase}" → use: ${replacement}\n`;
    }
    instruction += "\n";
  }

  // Human voice guidelines (static)
  instruction += `WRITE WITH AUTHENTIC HUMAN VOICE:
✓ Be diffident and partisan - have opinions, show uncertainty where genuine
✓ Choose words for emotional resonance and personal connection
✓ Include personal touches that show individuality and quirks
✓ Draw from lived experience - use personal anecdotes and emotional nuance when appropriate
✓ Vary sentence length unpredictably - mix short punchy sentences with longer flowing ones
✓ Use conversational rhythm that sounds like natural speech
✓ Include specific concrete details, not vague abstractions
✓ Write with personality - let emotion and perspective show through
✓ Embrace natural imperfection over polished prose
✓ Use unexpected word choices that feel genuine, not academic
✓ Write like you're talking to someone, not presenting a report
✓ Be direct and honest - cut the fluff and corporate speak
✓ Vary your tone - don't maintain the same energy throughout
✓ Sound clear, creative, nuanced, and expressive

`;

  // Robotic patterns section
  if (roboticPatterns.length > 0) {
    instruction += "AVOID THESE ROBOTIC PATTERNS:\n";
    for (const pattern of roboticPatterns) {
      instruction += `✗ ${pattern}\n`;
    }
  } else {
    // Default robotic patterns if none in database
    instruction += `AVOID THESE ROBOTIC PATTERNS:
✗ Repetitive sentence structures
✗ Overuse of ANY transition words
✗ Generic generalizations without specific examples
✗ Stiff, formal academic tone
✗ Perfectly balanced and polished phrasing
✗ Predictable conclusions or summaries
✗ Suggesting bullet points or lists in the actual content
✗ Corporate speak and buzzwords
✗ Overly formal or technical language when simpler words work better`;
  }

  // Cache the result
  cache = {
    timestamp: Date.now(),
    instruction,
  };

  return instruction;
}

// Export a function to clear the cache (useful when banned phrases are updated)
export function clearBannedPhrasesCache(): void {
  cache = null;
}
