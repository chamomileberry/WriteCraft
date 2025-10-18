/**
 * ModelSelector - Simplified to use Haiku 4.5 for all operations
 * 
 * Strategy: Use Claude Haiku 4.5 (claude-haiku-4-5) for everything
 * 
 * Rationale:
 * - Haiku 4.5 matches Sonnet 4 performance (73.3% vs 73% on SWE-bench)
 * - 3x cheaper than Sonnet 4.5 ($1 vs $3 per million input tokens)
 * - 3-5x faster response times (better UX)
 * - More than sufficient quality for creative writing tasks
 * - Simpler codebase and cost management
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
  | 'ai_suggestions';

export class ModelSelector {
  // Single model for all operations - Haiku 4.5 (released Oct 2025)
  private readonly HAIKU_4_5 = 'claude-haiku-4-5';
  
  /**
   * Select model for given operation
   * Returns Haiku 4.5 for all operations (simplified strategy)
   */
  selectModel(operationType: OperationType, textLength: number = 0): string {
    // Use Haiku 4.5 for everything - it matches Sonnet 4 performance
    // at 3x lower cost and 3-5x faster speed
    return this.HAIKU_4_5;
  }
  
  /**
   * Get model display name for logging
   */
  getModelDisplayName(model: string): string {
    return 'Haiku 4.5';
  }
  
  /**
   * Get estimated cost multiplier compared to Sonnet 4.5 baseline
   * Haiku 4.5 is 3x cheaper than Sonnet 4.5
   */
  getCostMultiplier(model: string): number {
    return 0.33; // Haiku 4.5 costs ~1/3 of Sonnet 4.5
  }
}

export const modelSelector = new ModelSelector();
