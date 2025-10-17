/**
 * ModelSelector - Intelligent model selection for cost optimization
 * 
 * This service automatically selects the most appropriate AI model based on:
 * - Operation type complexity
 * - Text length
 * - User subscription tier
 * 
 * Claude Haiku: 90% cheaper, used for simple tasks
 * Claude Sonnet: More capable, used for complex tasks
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
  | 'conversational_chat'
  | 'ai_suggestions';

export class ModelSelector {
  // Model identifiers
  private readonly HAIKU = 'claude-3-5-haiku-20241022';
  private readonly SONNET = 'claude-sonnet-4-20250514';
  
  // Simple operations that can use Haiku (90% cheaper)
  private readonly SIMPLE_OPERATIONS: OperationType[] = [
    'name_generation',
    'title_generation',
    'tag_generation',
    'word_definition',
    'synonym_generation'
  ];
  
  // Threshold for text length when using improve_text
  private readonly SHORT_TEXT_THRESHOLD = 500;
  
  /**
   * Select appropriate model based on task complexity
   */
  selectModel(operationType: OperationType, textLength: number = 0): string {
    // Simple tasks -> Use Haiku (90% cheaper)
    if (this.SIMPLE_OPERATIONS.includes(operationType)) {
      return this.HAIKU;
    }
    
    // Short text editing -> Use Haiku
    if (operationType === 'improve_text' && textLength < this.SHORT_TEXT_THRESHOLD) {
      return this.HAIKU;
    }
    
    // Description generation for simple objects -> Haiku
    if (operationType === 'description_generation' && textLength < this.SHORT_TEXT_THRESHOLD) {
      return this.HAIKU;
    }
    
    // Complex tasks -> Use Sonnet
    // This includes: character, setting, plot, conflict, theme, creature, plant generation
    // as well as conversational chat, AI suggestions, and long text improvement
    return this.SONNET;
  }
  
  /**
   * Get model display name for logging
   */
  getModelDisplayName(model: string): string {
    return model.includes('haiku') ? 'Haiku' : 'Sonnet';
  }
  
  /**
   * Get estimated cost multiplier compared to Sonnet baseline
   * Haiku is approximately 10x cheaper than Sonnet
   */
  getCostMultiplier(model: string): number {
    return model.includes('haiku') ? 0.1 : 1.0;
  }
}

export const modelSelector = new ModelSelector();
