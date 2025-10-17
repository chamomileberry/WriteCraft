/**
 * AI Helper - Centralized AI generation with cost optimization
 * 
 * This module provides utilities for:
 * - Intelligent model selection (Haiku vs Sonnet)
 * - Prompt caching to reduce costs by 90%
 * - Usage tracking for billing
 */

import Anthropic from '@anthropic-ai/sdk';
import { modelSelector, type OperationType } from '../services/modelSelector';
import { promptCache } from './promptCache';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface CachedAICallOptions {
  operationType: OperationType;
  userId?: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  textLength?: number;
  enableCaching?: boolean;
}

export interface AICallResult {
  content: string;
  usage: any;
  model: string;
}

/**
 * Make an AI call with intelligent model selection and optional prompt caching
 */
export async function makeAICall(options: CachedAICallOptions): Promise<AICallResult> {
  const {
    operationType,
    userId,
    systemPrompt,
    userPrompt,
    maxTokens = 2048,
    textLength = 0,
    enableCaching = true
  } = options;

  // Select appropriate model based on operation type
  const model = modelSelector.selectModel(operationType, textLength);

  // Prepare system messages with caching if enabled and user is known
  const systemMessages: Anthropic.Messages.MessageCreateParams['system'] = [];
  
  if (enableCaching && userId) {
    // Check if we have a cached version of this prompt
    const cachedPrompt = promptCache.getCachedPrompt(userId, operationType);
    
    if (cachedPrompt === systemPrompt) {
      // Same prompt - use cache control to leverage Anthropic's caching
      systemMessages.push({
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' }
      });
    } else {
      // Different prompt - update cache and mark for caching
      promptCache.setCachedPrompt(userId, operationType, systemPrompt);
      systemMessages.push({
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' }
      });
    }
  } else {
    // No caching - just use the system prompt
    systemMessages.push({
      type: 'text',
      text: systemPrompt
    });
  }

  // Make the API call
  const response = await anthropic.messages.create({
    model,
    system: systemMessages,
    max_tokens: maxTokens,
    messages: [
      { role: 'user', content: userPrompt }
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from Anthropic API');
  }

  return {
    content: content.text,
    usage: response.usage,
    model
  };
}

/**
 * Make a simple AI call without caching (for one-off requests)
 */
export async function makeSimpleAICall(
  operationType: OperationType,
  prompt: string,
  textLength: number = 0,
  maxTokens: number = 1024
): Promise<AICallResult> {
  const model = modelSelector.selectModel(operationType, textLength);

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'user', content: prompt }
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from Anthropic API');
  }

  return {
    content: content.text,
    usage: response.usage,
    model
  };
}

/**
 * Make a conversational AI call with history and caching
 */
export async function makeConversationalAICall(options: {
  operationType: OperationType;
  userId: string;
  systemPrompt: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  newMessage: string;
  maxTokens?: number;
}): Promise<AICallResult> {
  const {
    operationType,
    userId,
    systemPrompt,
    conversationHistory,
    newMessage,
    maxTokens = 1024
  } = options;

  // Select model for conversational tasks (always Sonnet for complex conversations)
  const model = modelSelector.selectModel(operationType);

  // Use caching for system prompt
  const cachedPrompt = promptCache.getCachedPrompt(userId, 'conversation_system');
  const systemMessages: Anthropic.Messages.MessageCreateParams['system'] = [];

  if (cachedPrompt === systemPrompt) {
    systemMessages.push({
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' }
    });
  } else {
    promptCache.setCachedPrompt(userId, 'conversation_system', systemPrompt);
    systemMessages.push({
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' }
    });
  }

  // Build messages array
  const messages = [
    ...conversationHistory,
    { role: 'user' as const, content: newMessage }
  ];

  const response = await anthropic.messages.create({
    model,
    system: systemMessages,
    max_tokens: maxTokens,
    messages,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response format from Anthropic API');
  }

  return {
    content: content.text,
    usage: response.usage,
    model
  };
}
