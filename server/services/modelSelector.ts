/**
 * ModelSelector - Hybrid strategy using Haiku 4.5 by default with Opus 4.1 for premium features
 * 
 * Strategy:
 * - Haiku 4.5 (claude-haiku-4-5) for standard operations (fast, cost-effective)
 * - Opus 4.1 (claude-opus-4-20250514) for premium features (highest quality)
 * 
 * Premium Features (Professional/Team tiers only):
 * - Polish: Enhance generated content with literary quality
 * - Extended Thinking: Deep reasoning for complex creative analysis
 * 
 * Cost Comparison:
 * - Haiku 4.5: $1 input / $5 output per 1M tokens (3-5x faster)
 * - Opus 4.1: $15 input / $75 output per 1M tokens (15x more expensive, highest quality)
 */

export type OperationType = 
  | 'name_generation'
  | 'title_generation'
  | 'tag_generation'
  | 'word_definition'
  | 'synonym_generation'
  | 'character_generation'
  | 'setting_generation'
  | 'plot_generation'
  | 'conflict_generation'
  | 'theme_generation'
  | 'creature_generation'
  | 'plant_generation'
  | 'description_generation'
  | 'mood_palette_generation'
  | 'improve_text'
  | 'field_generation'
  | 'text_improvement'
  | 'conversational_chat'
  | 'ai_suggestions'
  | 'polish'              // Premium: Opus 4.1 for polishing generated content
  | 'extended_thinking';  // Premium: Opus 4.1 for deep reasoning in chat

export class ModelSelector {
  // Models
  private readonly HAIKU_4_5 = 'claude-haiku-4-5';
  private readonly OPUS_4_1 = 'claude-opus-4-20250514';
  
  /**
   * Select model for given operation
   * - Standard operations use Haiku 4.5 (fast, cost-effective)
   * - Premium operations use Opus 4.1 (highest quality)
   */
  selectModel(operationType: OperationType, textLength: number = 0): string {
    // Premium operations use Opus 4.1
    if (operationType === 'polish' || operationType === 'extended_thinking') {
      return this.OPUS_4_1;
    }
    
    // All standard operations use Haiku 4.5
    return this.HAIKU_4_5;
  }
  
  /**
   * Check if operation requires premium tier access
   */
  isPremiumOperation(operationType: OperationType): boolean {
    return operationType === 'polish' || operationType === 'extended_thinking';
  }
  
  /**
   * Get model display name for logging
   */
  getModelDisplayName(model: string): string {
    if (model === this.OPUS_4_1) {
      return 'Opus 4.1';
    }
    return 'Haiku 4.5';
  }
  
  /**
   * Get estimated cost multiplier compared to Sonnet 4.5 baseline
   */
  getCostMultiplier(model: string): number {
    if (model === this.OPUS_4_1) {
      return 5.0; // Opus is ~5x more expensive than Sonnet 4.5
    }
    return 0.33; // Haiku 4.5 costs ~1/3 of Sonnet 4.5
  }
}

export const modelSelector = new ModelSelector();
