import { AIProvider, AIGenerateOptions, AIGenerateResult, AIMessage } from './types.js';
import { GeminiProvider, GroqProvider, OpenAIProvider } from './providers/index.js';
import { configLoader, AIModelConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { retry } from '../utils/retry.js';

/**
 * AI Client with automatic fallback support
 * Manages multiple AI providers and handles tier-based fallback
 */
export class AIClient {
  private providers: Map<string, AIProvider> = new Map();
  private usageTracking: Map<string, number> = new Map();

  constructor() {
    this.initializeProviders();
  }

  /**
   * Initialize AI providers from config
   */
  private initializeProviders(): void {
    const secrets = configLoader.loadSecrets();

    // Initialize Gemini
    if (secrets.ai.google.apiKey) {
      this.providers.set('google', new GeminiProvider(secrets.ai.google.apiKey));
      logger.info('Initialized Gemini provider');
    }

    // Initialize Groq
    if (secrets.ai.groq.apiKey) {
      this.providers.set('groq', new GroqProvider(secrets.ai.groq.apiKey));
      logger.info('Initialized Groq provider');
    }

    // Initialize OpenAI
    if (secrets.ai.openai.apiKey) {
      this.providers.set('openai', new OpenAIProvider(secrets.ai.openai.apiKey));
      logger.info('Initialized OpenAI provider');
    }

    if (this.providers.size === 0) {
      throw new Error('No AI providers configured. Please add API keys to secrets.enc.yaml');
    }
  }

  /**
   * Generate content with automatic fallback
   */
  async generate(
    prompt: string,
    options: AIGenerateOptions & { tier?: 'tier1' | 'tier2' | 'tier3' } = {}
  ): Promise<AIGenerateResult> {
    const config = configLoader.loadAgentsConfig();
    const { tier = 'tier1', ...generateOptions } = options;

    // Get tier configuration
    const tierConfig = config.globalSettings.aiModels[tier];
    const fallbackChain = config.globalSettings.fallbackChain;

    // Try each tier in fallback chain
    for (const currentTier of fallbackChain) {
      if (fallbackChain.indexOf(currentTier) < fallbackChain.indexOf(tier)) {
        continue; // Skip tiers before the requested tier
      }

      const currentTierConfig = config.globalSettings.aiModels[currentTier];
      const provider = this.providers.get(currentTierConfig.provider);

      if (!provider) {
        logger.warn(`Provider ${currentTierConfig.provider} not available, trying next tier`);
        continue;
      }

      try {
        logger.info(`Attempting generation with ${currentTier} (${currentTierConfig.provider})`);

        const result = await retry(
          () =>
            provider.generate(prompt, {
              ...generateOptions,
              model: currentTierConfig.model,
              temperature: generateOptions.temperature ?? currentTierConfig.temperature,
              maxTokens: generateOptions.maxTokens ?? currentTierConfig.maxTokens,
            }),
          {
            maxAttempts: 2,
            shouldRetry: (error) => {
              // Retry on rate limits (429) or temporary errors
              // Check status code first (more reliable), then fall back to message matching
              if (error.status === 429) return true;
              
              const errorStr = error.message?.toLowerCase() || '';
              const retryableErrors = [
                'rate limit',
                '429',
                'too many requests',
                'timeout'
              ];
              
              return retryableErrors.some(pattern => errorStr.includes(pattern));
            },
          }
        );

        // Track usage and cost
        this.trackUsage(currentTier, currentTierConfig, result);

        logger.info(
          `Generation successful with ${currentTier}: ${result.usage?.totalTokens || 0} tokens`
        );

        return result;
      } catch (error: any) {
        logger.error(`Generation failed with ${currentTier}:`, error.message);

        // If this is the last tier, throw the error
        if (currentTier === fallbackChain[fallbackChain.length - 1]) {
          throw error;
        }

        logger.info('Falling back to next tier...');
      }
    }

    throw new Error('All AI providers failed');
  }

  /**
   * Generate with messages (chat-style)
   */
  async generateWithMessages(
    messages: AIMessage[],
    options: AIGenerateOptions & { tier?: 'tier1' | 'tier2' | 'tier3' } = {}
  ): Promise<AIGenerateResult> {
    const config = configLoader.loadAgentsConfig();
    const { tier = 'tier1', ...generateOptions } = options;

    const tierConfig = config.globalSettings.aiModels[tier];
    const provider = this.providers.get(tierConfig.provider);

    if (!provider) {
      throw new Error(`Provider ${tierConfig.provider} not available`);
    }

    const result = await provider.generateWithMessages(messages, {
      ...generateOptions,
      model: tierConfig.model,
      temperature: generateOptions.temperature ?? tierConfig.temperature,
      maxTokens: generateOptions.maxTokens ?? tierConfig.maxTokens,
    });

    this.trackUsage(tier, tierConfig, result);

    return result;
  }

  /**
   * Track usage and cost
   */
  private trackUsage(tier: string, config: AIModelConfig, result: AIGenerateResult): void {
    const cost = config.costPerRequest || 0;
    const currentCost = this.usageTracking.get(tier) || 0;
    this.usageTracking.set(tier, currentCost + cost);

    logger.debug(`Usage tracking - ${tier}: $${currentCost + cost} (this request: $${cost})`);
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): Record<string, number> {
    return Object.fromEntries(this.usageTracking);
  }

  /**
   * Reset usage tracking
   */
  resetUsageStats(): void {
    this.usageTracking.clear();
  }
}
