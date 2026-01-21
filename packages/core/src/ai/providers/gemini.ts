import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIGenerateOptions, AIGenerateResult, AIMessage } from '../types.js';
import { logger } from '../../utils/logger.js';

/**
 * Google Gemini AI Provider
 */
export class GeminiProvider implements AIProvider {
  name = 'google';
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
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
      const modelName = options.model || 'gemini-2.5-flash';
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
