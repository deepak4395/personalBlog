import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIClient } from '../src/ai/client.js';
import { configLoader } from '../src/config/index.js';

// Mock the config loader
vi.mock('../src/config/index.js', () => ({
  configLoader: {
    loadSecrets: vi.fn(),
    loadAgentsConfig: vi.fn(),
  },
}));

// Mock the providers
vi.mock('../src/ai/providers/index.js', () => ({
  GeminiProvider: vi.fn().mockImplementation(() => ({
    generate: vi.fn(),
    generateWithMessages: vi.fn(),
  })),
  GroqProvider: vi.fn().mockImplementation(() => ({
    generate: vi.fn(),
    generateWithMessages: vi.fn(),
  })),
  OpenAIProvider: vi.fn().mockImplementation(() => ({
    generate: vi.fn(),
    generateWithMessages: vi.fn(),
  })),
}));

// Mock logger
vi.mock('../src/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock retry utility
vi.mock('../src/utils/retry.js', () => ({
  retry: vi.fn((fn) => fn()),
}));

describe('AIClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock config
    vi.mocked(configLoader.loadSecrets).mockReturnValue({
      ai: {
        google: { apiKey: 'test-gemini-key' },
        groq: { apiKey: 'test-groq-key' },
        openai: { apiKey: 'test-openai-key' },
        anthropic: { apiKey: '' },
      },
    } as any);

    vi.mocked(configLoader.loadAgentsConfig).mockReturnValue({
      globalSettings: {
        aiModels: {
          tier1: {
            provider: 'google',
            model: 'gemini-1.5-flash',
            temperature: 0.7,
            maxTokens: 8000,
            costPerRequest: 0.001,
          },
          tier2: {
            provider: 'groq',
            model: 'llama-3.1-8b',
            temperature: 0.7,
            maxTokens: 8000,
            costPerRequest: 0.0005,
          },
          tier3: {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            temperature: 0.7,
            maxTokens: 4000,
            costPerRequest: 0.002,
          },
        },
        fallbackChain: ['tier1', 'tier2', 'tier3'],
        contentPath: './content',
        defaultRateLimit: {
          requestsPerMinute: 10,
          maxConcurrent: 3,
        },
        budget: {
          dailyLimit: 10,
          monthlyLimit: 300,
        },
      },
      agents: {},
      secretsFile: './config/secrets.enc.yaml',
    } as any);
  });

  describe('Provider Initialization', () => {
    it('should initialize providers from config', () => {
      const client = new AIClient();
      expect(configLoader.loadSecrets).toHaveBeenCalled();
    });

    it('should throw error when no providers configured', () => {
      vi.mocked(configLoader.loadSecrets).mockReturnValue({
        ai: {
          google: { apiKey: '' },
          groq: { apiKey: '' },
          openai: { apiKey: '' },
          anthropic: { apiKey: '' },
        },
      } as any);

      expect(() => new AIClient()).toThrow('No AI providers configured');
    });
  });

  describe('Fallback Chain Behavior', () => {
    it('should use tier1 provider by default', async () => {
      const { GeminiProvider } = await import('../src/ai/providers/index.js');
      const mockGenerate = vi.fn().mockResolvedValue({
        content: 'Test response',
        usage: { totalTokens: 100 },
      });

      vi.mocked(GeminiProvider).mockImplementation(
        () =>
          ({
            generate: mockGenerate,
          }) as any
      );

      const client = new AIClient();
      await client.generate('test prompt');

      expect(mockGenerate).toHaveBeenCalled();
    });

    it('should fallback to tier2 when tier1 fails', async () => {
      const { GeminiProvider, GroqProvider } = await import('../src/ai/providers/index.js');
      const { retry } = await import('../src/utils/retry.js');

      const mockGeminiGenerate = vi.fn().mockRejectedValue(new Error('Tier1 failed'));
      const mockGroqGenerate = vi.fn().mockResolvedValue({
        content: 'Test response from tier2',
        usage: { totalTokens: 100 },
      });

      vi.mocked(GeminiProvider).mockImplementation(
        () =>
          ({
            generate: mockGeminiGenerate,
          }) as any
      );

      vi.mocked(GroqProvider).mockImplementation(
        () =>
          ({
            generate: mockGroqGenerate,
          }) as any
      );

      // Mock retry to actually call the function
      vi.mocked(retry).mockImplementation(async (fn: any) => {
        return await fn();
      });

      const client = new AIClient();
      const result = await client.generate('test prompt');

      expect(result.content).toBe('Test response from tier2');
      expect(mockGroqGenerate).toHaveBeenCalled();
    });

    it('should fallback through all tiers when previous tiers fail', async () => {
      const { GeminiProvider, GroqProvider, OpenAIProvider } = await import(
        '../src/ai/providers/index.js'
      );
      const { retry } = await import('../src/utils/retry.js');

      const mockGeminiGenerate = vi.fn().mockRejectedValue(new Error('Tier1 failed'));
      const mockGroqGenerate = vi.fn().mockRejectedValue(new Error('Tier2 failed'));
      const mockOpenAIGenerate = vi.fn().mockResolvedValue({
        content: 'Test response from tier3',
        usage: { totalTokens: 100 },
      });

      vi.mocked(GeminiProvider).mockImplementation(
        () =>
          ({
            generate: mockGeminiGenerate,
          }) as any
      );

      vi.mocked(GroqProvider).mockImplementation(
        () =>
          ({
            generate: mockGroqGenerate,
          }) as any
      );

      vi.mocked(OpenAIProvider).mockImplementation(
        () =>
          ({
            generate: mockOpenAIGenerate,
          }) as any
      );

      // Mock retry to actually call the function
      vi.mocked(retry).mockImplementation(async (fn: any) => {
        return await fn();
      });

      const client = new AIClient();
      const result = await client.generate('test prompt');

      expect(result.content).toBe('Test response from tier3');
      expect(mockOpenAIGenerate).toHaveBeenCalled();
    });

    it('should throw error when all providers fail', async () => {
      const { GeminiProvider, GroqProvider, OpenAIProvider } = await import(
        '../src/ai/providers/index.js'
      );
      const { retry } = await import('../src/utils/retry.js');

      const mockGenerate = vi.fn().mockRejectedValue(new Error('Provider failed'));

      vi.mocked(GeminiProvider).mockImplementation(
        () =>
          ({
            generate: mockGenerate,
          }) as any
      );

      vi.mocked(GroqProvider).mockImplementation(
        () =>
          ({
            generate: mockGenerate,
          }) as any
      );

      vi.mocked(OpenAIProvider).mockImplementation(
        () =>
          ({
            generate: mockGenerate,
          }) as any
      );

      // Mock retry to actually call the function
      vi.mocked(retry).mockImplementation(async (fn: any) => {
        return await fn();
      });

      const client = new AIClient();

      await expect(client.generate('test prompt')).rejects.toThrow('Provider failed');
    });
  });

  describe('Usage Tracking and Cost Calculation', () => {
    it('should track usage for successful generation', async () => {
      const { GeminiProvider } = await import('../src/ai/providers/index.js');
      const mockGenerate = vi.fn().mockResolvedValue({
        content: 'Test response',
        usage: { totalTokens: 100 },
      });

      vi.mocked(GeminiProvider).mockImplementation(
        () =>
          ({
            generate: mockGenerate,
          }) as any
      );

      const client = new AIClient();
      await client.generate('test prompt');

      const stats = client.getUsageStats();
      expect(stats.tier1).toBe(0.001);
    });

    it('should accumulate costs across multiple requests', async () => {
      const { GeminiProvider } = await import('../src/ai/providers/index.js');
      const mockGenerate = vi.fn().mockResolvedValue({
        content: 'Test response',
        usage: { totalTokens: 100 },
      });

      vi.mocked(GeminiProvider).mockImplementation(
        () =>
          ({
            generate: mockGenerate,
          }) as any
      );

      const client = new AIClient();
      await client.generate('test prompt 1');
      await client.generate('test prompt 2');
      await client.generate('test prompt 3');

      const stats = client.getUsageStats();
      expect(stats.tier1).toBe(0.003);
    });

    it('should reset usage stats', async () => {
      const { GeminiProvider } = await import('../src/ai/providers/index.js');
      const mockGenerate = vi.fn().mockResolvedValue({
        content: 'Test response',
        usage: { totalTokens: 100 },
      });

      vi.mocked(GeminiProvider).mockImplementation(
        () =>
          ({
            generate: mockGenerate,
          }) as any
      );

      const client = new AIClient();
      await client.generate('test prompt');

      let stats = client.getUsageStats();
      expect(stats.tier1).toBe(0.001);

      client.resetUsageStats();
      stats = client.getUsageStats();
      expect(stats.tier1).toBeUndefined();
    });
  });

  describe('Retry Logic for Rate Limits', () => {
    it('should retry on rate limit errors', async () => {
      const { GeminiProvider } = await import('../src/ai/providers/index.js');
      const { retry } = await import('../src/utils/retry.js');

      const mockGenerate = vi.fn().mockResolvedValue({
        content: 'Test response',
        usage: { totalTokens: 100 },
      });

      vi.mocked(GeminiProvider).mockImplementation(
        () =>
          ({
            generate: mockGenerate,
          }) as any
      );

      // Verify retry is called with shouldRetry function
      let shouldRetryFn: any;
      vi.mocked(retry).mockImplementation(async (fn: any, options: any) => {
        shouldRetryFn = options?.shouldRetry;
        return await fn();
      });

      const client = new AIClient();
      await client.generate('test prompt');

      expect(retry).toHaveBeenCalled();
      expect(shouldRetryFn).toBeDefined();

      // Test shouldRetry logic
      const rateLimitError = { status: 429, message: 'Rate limit exceeded' };
      expect(shouldRetryFn(rateLimitError)).toBe(true);
    });

    it('should detect rate limit from status code', async () => {
      const { GeminiProvider } = await import('../src/ai/providers/index.js');
      const { retry } = await import('../src/utils/retry.js');

      const mockGenerate = vi.fn().mockResolvedValue({
        content: 'Test response',
        usage: { totalTokens: 100 },
      });

      vi.mocked(GeminiProvider).mockImplementation(
        () =>
          ({
            generate: mockGenerate,
          }) as any
      );

      let shouldRetryFn: any;
      vi.mocked(retry).mockImplementation(async (fn: any, options: any) => {
        shouldRetryFn = options?.shouldRetry;
        return await fn();
      });

      const client = new AIClient();
      await client.generate('test prompt');

      // Test various rate limit indicators
      expect(shouldRetryFn({ status: 429 })).toBe(true);
      expect(shouldRetryFn({ message: 'rate limit exceeded' })).toBe(true);
      expect(shouldRetryFn({ message: 'Too many requests' })).toBe(true);
      expect(shouldRetryFn({ message: 'timeout' })).toBe(true);
      expect(shouldRetryFn({ message: 'other error' })).toBe(false);
    });
  });
});
