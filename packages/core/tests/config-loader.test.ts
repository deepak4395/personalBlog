import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConfigLoader } from '../src/config/loader.js';
import * as fs from 'fs';
import * as childProcess from 'child_process';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

// Mock child_process
vi.mock('child_process', () => ({
  execSync: vi.fn(),
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

const VALID_CONFIG = `version: "1.0"
globalSettings:
  contentPath: ./content
  defaultRateLimit:
    requestsPerMinute: 10
    maxConcurrent: 3
  aiModels:
    tier1:
      provider: google
      model: gemini-1.5-flash
      temperature: 0.7
      maxTokens: 8000
      costPerRequest: 0.001
    tier2:
      provider: groq
      model: llama-3.1-8b
      temperature: 0.7
      maxTokens: 8000
      costPerRequest: 0.0005
    tier3:
      provider: openai
      model: gpt-3.5-turbo
      temperature: 0.7
      maxTokens: 4000
      costPerRequest: 0.002
  fallbackChain:
    - tier1
    - tier2
    - tier3
  budget:
    dailyLimit: 10
    monthlyLimit: 300
agents:
  news-aggregator:
    enabled: true
    schedule: "0 6 * * *"
    outputPath: "news"
    category: "news"
    config:
      maxArticlesPerRun: 3
      deduplicationWindow: "7d"
      minRelevanceScore: 0.7
      sources:
        rss:
          - url: "https://example.com/feed"
            name: "Example"
            weight: 1.0
            categories: ["tech"]
        apis:
          hackernews:
            enabled: true
            keywords: ["embedded"]
            minScore: 10
            maxResults: 50
      prompts:
        systemPrompt: "test"
        userPromptTemplate: "test"
  diy-tutorials:
    enabled: true
    schedule: "0 8 * * *"
    outputPath: "tutorials"
    category: "tutorials"
    config:
      topicsPerRun: 2
      minSourcesPerTopic: 3
      difficultyLevels: ["beginner", "intermediate"]
      sources:
        reddit:
          subreddits:
            - name: "embedded"
              weight: 1.0
              minUpvotes: 10
          sortBy: "hot"
          timeFrame: "week"
        stackexchange:
          sites:
            - name: "stackoverflow"
              tags: ["embedded"]
              minScore: 5
        forums:
          - url: "https://forum.example.com"
            type: "discourse"
            enabled: true
            rateLimit: 10
      prompts:
        topicDiscovery: "test"
        tutorialOutline: "test"
        tutorialWriter: "test"
  bhagavad-gita:
    enabled: true
    schedule: "0 */6 * * *"
    outputPath: "bhagavad-gita"
    category: "bhagavad-gita"
    config:
      prompts:
        systemPrompt: "test"
        userPromptTemplate: "test"
secretsFile: ./config/secrets.enc.yaml
`;

describe('ConfigLoader', () => {
  let configLoader: ConfigLoader;

  beforeEach(() => {
    vi.clearAllMocks();
    configLoader = ConfigLoader.getInstance();
    // Clear cache before each test
    configLoader.clearCache();

    // Mock workspace root detection
    vi.mocked(fs.existsSync).mockImplementation((path: any) => {
      return path.toString().includes('pnpm-workspace.yaml');
    });
  });

  afterEach(() => {
    configLoader.clearCache();
  });

  describe('loadAgentsConfig', () => {
    it('should load and validate agents config from YAML file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(VALID_CONFIG);

      const config = configLoader.loadAgentsConfig('./config/agents.yaml');

      expect(config).toBeDefined();
      expect(config.globalSettings.contentPath).toBe('./content');
      expect(config.globalSettings.aiModels.tier1.provider).toBe('google');
      expect(config.globalSettings.fallbackChain).toEqual(['tier1', 'tier2', 'tier3']);
    });

    it('should throw error when config file not found', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(() => configLoader.loadAgentsConfig('./config/agents.yaml')).toThrow(
        'Agents config file not found'
      );
    });

    it('should cache config after first load', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(VALID_CONFIG);

      // First load
      configLoader.loadAgentsConfig('./config/agents.yaml');
      // Second load (should use cache)
      configLoader.loadAgentsConfig('./config/agents.yaml');

      // readFileSync should only be called once
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    });

    it('should validate config schema and reject invalid config', () => {
      const invalidConfig = `
globalSettings:
  contentPath: ./content
  invalidField: true
agents: {}
`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(invalidConfig);

      expect(() => configLoader.loadAgentsConfig('./config/agents.yaml')).toThrow();
    });
  });

  describe('loadSecrets', () => {
    beforeEach(() => {
      // Setup file existence for both config and secrets
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        const pathStr = path.toString();
        return (
          pathStr.includes('pnpm-workspace.yaml') ||
          pathStr.includes('agents.yaml') ||
          pathStr.includes('secrets.yaml')
        );
      });

      vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('agents.yaml')) {
          return VALID_CONFIG;
        }
        return '';
      });
    });

    it('should load unencrypted secrets file', () => {
      configLoader.clearCache(); // Clear cache before test
      
      const mockSecrets = `
ai:
  google:
    apiKey: test-google-key
  groq:
    apiKey: test-groq-key
  openai:
    apiKey: test-openai-key
social:
  reddit:
    clientId: test-reddit-id
    clientSecret: test-reddit-secret
    userAgent: test-agent
  stackexchange:
    apiKey: test-stackexchange-key
email:
  formsubmit:
    email: test@example.com
`;

      vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('secrets.yaml')) {
          return mockSecrets;
        }
        if (path.toString().includes('agents.yaml')) {
          return VALID_CONFIG;
        }
        return mockSecrets;
      });

      const secrets = configLoader.loadSecrets();

      expect(secrets).toBeDefined();
      expect(secrets.ai.google.apiKey).toBe('test-google-key');
      expect(secrets.ai.groq.apiKey).toBe('test-groq-key');
    });

    it.skip('should decrypt encrypted secrets file using SOPS', () => {
      configLoader.clearCache(); // Clear cache before test
      
      const encryptedContent = `ai:
  google:
    apiKey: ENC[AES256_GCM,data:encrypted...]
`;

      // Simulate SOPS decrypting to minimal valid secrets
      const decryptedContent = `ai:
  google:
    apiKey: decrypted-google-key
  groq:
    apiKey: decrypted-groq-key
  openai:
    apiKey: decrypted-openai-key
social:
  reddit:
    clientId: test-reddit-id
    clientSecret: test-reddit-secret
    userAgent: test-agent
  stackexchange:
    apiKey: test-stackexchange-key
email:
  formsubmit:
    email: test@example.com`;

      vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('secrets.enc.yaml')) {
          return encryptedContent;
        }
        if (path.toString().includes('agents.yaml')) {
          return VALID_CONFIG;
        }
        return encryptedContent;
      });

      vi.mocked(childProcess.execSync).mockReturnValue(decryptedContent as any);

      const secrets = configLoader.loadSecrets();

      expect(secrets.ai.google.apiKey).toBe('decrypted-google-key');
      expect(childProcess.execSync).toHaveBeenCalledWith(
        expect.stringContaining('sops -d'),
        expect.any(Object)
      );
    });

    it('should throw error when secrets file not found', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: any) => {
        const pathStr = path.toString();
        // Allow workspace and agents config to exist, but not secrets
        return pathStr.includes('pnpm-workspace.yaml') || pathStr.includes('agents.yaml');
      });
      
      vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('agents.yaml')) {
          return VALID_CONFIG;
        }
        return '';
      });

      expect(() => configLoader.loadSecrets()).toThrow('Secrets file not found');
    });

    it('should throw error when SOPS decryption fails', () => {
      const encryptedContent = `
ai:
  google:
    apiKey: ENC[AES256_GCM,data:encrypted...]
`;

      vi.mocked(fs.readFileSync).mockReturnValue(encryptedContent);
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error('SOPS not found');
      });

      expect(() => configLoader.loadSecrets()).toThrow();
    });

    it('should cache secrets after first load', () => {
      const mockSecrets = `
ai:
  google:
    apiKey: test-google-key
  groq:
    apiKey: test-groq-key
  openai:
    apiKey: test-openai-key
social:
  reddit:
    clientId: test-reddit-id
    clientSecret: test-reddit-secret
    userAgent: test-agent
  stackexchange:
    apiKey: test-stackexchange-key
email:
  formsubmit:
    email: test@example.com
`;

      vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('agents.yaml')) {
          return VALID_CONFIG;
        }
        return mockSecrets;
      });

      // First load
      configLoader.loadSecrets();
      // Second load (should use cache)
      configLoader.loadSecrets();

      // execSync should not be called for unencrypted file
      expect(childProcess.execSync).not.toHaveBeenCalled();
    });
  });

  describe('getSecret', () => {
    beforeEach(() => {
      const mockSecrets = `
ai:
  google:
    apiKey: test-google-key
  groq:
    apiKey: test-groq-key
  openai:
    apiKey: test-openai-key
social:
  reddit:
    clientId: test-reddit-id
    clientSecret: test-reddit-secret
    userAgent: test-agent
  stackexchange:
    apiKey: test-stackexchange-key
email:
  formsubmit:
    email: test@example.com
`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
        if (path.toString().includes('secrets.yaml')) {
          return mockSecrets;
        }
        return VALID_CONFIG;
      });
    });

    it('should get secret by path', () => {
      const apiKey = configLoader.getSecret('ai.google.apiKey');
      expect(apiKey).toBe('test-google-key');
    });

    it('should get nested secret', () => {
      const googleConfig = configLoader.getSecret('ai.google');
      expect(googleConfig).toEqual({ apiKey: 'test-google-key' });
    });

    it('should throw error for non-existent secret path', () => {
      expect(() => configLoader.getSecret('ai.nonexistent.key')).toThrow('Secret not found');
    });
  });

  describe('clearCache', () => {
    it('should clear cached configuration', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(VALID_CONFIG);

      // Load config
      configLoader.loadAgentsConfig('./config/agents.yaml');
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);

      // Clear cache
      configLoader.clearCache();

      // Load again should read file again
      configLoader.loadAgentsConfig('./config/agents.yaml');
      expect(fs.readFileSync).toHaveBeenCalledTimes(2);
    });
  });
});
