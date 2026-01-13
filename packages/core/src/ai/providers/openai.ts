import OpenAI from 'openai';
import { AIProvider, AIGenerateOptions, AIGenerateResult, AIMessage } from '../types.js';
import { logger } from '../../utils/logger.js';

/**
 * OpenAI Provider
 */
export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
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
      const modelName = options.model || 'gpt-4o-mini';
      logger.info(`Generating with OpenAI model: ${modelName}`);

      const response = await this.client.chat.completions.create({
        model: modelName,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 8000,
        ...(options.responseFormat === 'json' && {
          response_format: { type: 'json_object' },
        }),
      });

      const content = response.choices[0]?.message?.content || '';

      return {
        content,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: modelName,
        provider: this.name,
      };
    } catch (error: any) {
      logger.error('OpenAI generation failed:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}
