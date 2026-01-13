/**
 * AI Client Types and Interfaces
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  systemPrompt?: string;
}

export interface AIGenerateResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export interface AIProvider {
  name: string;
  generate(prompt: string, options?: AIGenerateOptions): Promise<AIGenerateResult>;
  generateWithMessages(messages: AIMessage[], options?: AIGenerateOptions): Promise<AIGenerateResult>;
}
