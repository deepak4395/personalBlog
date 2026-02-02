import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIGenerateOptions, AIGenerateResult, AIMessage } from '../types.js';
import { logger } from '../../utils/logger.js';

/**
 * Google Gemini AI Provider
 */
export class GeminiProvider implements AIProvider {
  name = 'google';
  private client: GoogleGenerativeAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Fetch available Gemini models from the API
   */
  async listAvailableModels(): Promise<string[]> {
    try {
      // Use the models.list endpoint to get current models
      // https://generativelanguage.googleapis.com/v1beta/models
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        logger.warn('Failed to fetch Gemini models list, using defaults');
        return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3-flash', 'gemini-3-pro'];
      }
      
      const data = await response.json() as any;
      const models = data.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        ?.map((m: any) => m.name.replace('models/', '')) || [];
      
      logger.info(`Available Gemini models: ${models.join(', ')}`);
      return models;
    } catch (error) {
      logger.warn('Error fetching Gemini models, using defaults:', error);
      return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3-flash', 'gemini-3-pro'];
    }
  }

  /**
   * Select the best available model from a preferred list
   */
  private async selectBestAvailableModel(preferredModel?: string): Promise<string> {
    const availableModels = await this.listAvailableModels();
    
    // If preferred model is available, use it
    if (preferredModel && availableModels.includes(preferredModel)) {
      return preferredModel;
    }
    
    // Fallback hierarchy: flash models are faster/cheaper, use those first
    const fallbackOrder = [
      'gemini-2.5-flash',
      'gemini-3-flash', 
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro',
      'gemini-3-pro'
    ];
    
    for (const model of fallbackOrder) {
      if (availableModels.includes(model)) {
        logger.info(`Selected available model: ${model}`);
        return model;
      }
    }
    
    // If nothing matches, use the first available
    if (availableModels.length > 0) {
      logger.warn(`Using first available model: ${availableModels[0]}`);
      return availableModels[0];
    }
    
    throw new Error('No Gemini models available');
  }

  async generate(prompt: string, options: AIGenerateOptions = {}): Promise<AIGenerateResult> {
    const messages: AIMessage[] = [];
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    return this.generateWithMessages(messages, options);
  }

  async generateWithMessages(
    messages: AIMessage[],
    options: AIGenerateOptions = {}
  ): Promise<AIGenerateResult> {
    try {
      // Use dynamic model selection instead of hardcoded default
      const requestedModel = options.model || 'gemini-2.5-flash';
      const modelName = await this.selectBestAvailableModel(requestedModel);
      
      logger.info(`Generating with Gemini model: ${modelName}`);

      const model = this.client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 8000,
          ...(options.responseFormat === 'json' && {
            responseMimeType: 'application/json',
          }),
        },
      });

      // Gemini uses a different message format
      const systemPrompt = messages.find((m) => m.role === 'system')?.content;
      const userMessages = messages.filter((m) => m.role !== 'system');

      // Combine system prompt with first user message if exists
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n${userMessages.map((m) => m.content).join('\n\n')}`
        : userMessages.map((m) => m.content).join('\n\n');

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      return {
        content: text,
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
        },
        model: modelName,
        provider: this.name,
      };
    } catch (error: any) {
      logger.error('Gemini generation failed - Full error object:');
      logger.error(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      const errorMessage = error.message || error.toString() || 'Unknown error';
      const enhancedError: any = new Error(`Gemini API error: ${errorMessage}`);
      
      // Preserve status code if available for better error handling
      if (error.status) {
        enhancedError.status = error.status;
        enhancedError.statusText = error.statusText;
      }
      
      throw enhancedError;
    }
  }
}
