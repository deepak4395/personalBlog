import { z } from 'zod';

/**
 * Zod schemas for configuration validation
 */

// AI Model Configuration
export const AIModelConfigSchema = z.object({
  provider: z.enum(['google', 'groq', 'openai', 'anthropic']),
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().positive().default(8000),
  costPerRequest: z.number().min(0).default(0),
});

export const AIModelsSchema = z.object({
  tier1: AIModelConfigSchema,
  tier2: AIModelConfigSchema,
  tier3: AIModelConfigSchema,
});

// Budget Configuration
export const BudgetSchema = z.object({
  dailyLimit: z.number().positive(),
  monthlyLimit: z.number().positive(),
});

// Global Settings
export const GlobalSettingsSchema = z.object({
  contentPath: z.string(),
  defaultRateLimit: z.object({
    requestsPerMinute: z.number().positive(),
    maxConcurrent: z.number().positive(),
  }),
  aiModels: AIModelsSchema,
  fallbackChain: z.array(z.enum(['tier1', 'tier2', 'tier3'])),
  budget: BudgetSchema,
});

// Agent Configuration (base)
export const BaseAgentConfigSchema = z.object({
  enabled: z.boolean(),
  schedule: z.string(), // cron expression
  outputPath: z.string(),
  category: z.string(),
  aiModel: z.enum(['tier1', 'tier2', 'tier3']).optional(),
});

// News Aggregator Agent Config
export const NewsAgentConfigSchema = BaseAgentConfigSchema.extend({
  config: z.object({
    maxArticlesPerRun: z.number().positive(),
    deduplicationWindow: z.string(),
    minRelevanceScore: z.number().min(0).max(1),
    sources: z.object({
      rss: z.array(
        z.object({
          url: z.string().url(),
          name: z.string(),
          weight: z.number().positive(),
          categories: z.array(z.string()),
        })
      ),
      apis: z.object({
        hackernews: z.object({
          enabled: z.boolean(),
          keywords: z.array(z.string()),
          minScore: z.number(),
          maxResults: z.number(),
        }),
      }),
    }),
    prompts: z.object({
      systemPrompt: z.string(),
      userPromptTemplate: z.string(),
    }),
  }),
});

// DIY Tutorials Agent Config
export const DIYAgentConfigSchema = BaseAgentConfigSchema.extend({
  config: z.object({
    topicsPerRun: z.number().positive(),
    minSourcesPerTopic: z.number().positive(),
    difficultyLevels: z.array(z.string()),
    sources: z.object({
      reddit: z.object({
        subreddits: z.array(
          z.object({
            name: z.string(),
            weight: z.number(),
            minUpvotes: z.number(),
          })
        ),
        sortBy: z.string(),
        timeFrame: z.string(),
      }),
      stackexchange: z.object({
        sites: z.array(
          z.object({
            name: z.string(),
            tags: z.array(z.string()),
            minScore: z.number(),
          })
        ),
      }),
      forums: z.array(
        z.object({
          url: z.string().url(),
          type: z.string(),
          enabled: z.boolean(),
          rateLimit: z.number(),
        })
      ),
    }),
    prompts: z.object({
      topicDiscovery: z.string(),
      tutorialOutline: z.string(),
      tutorialWriter: z.string(),
    }),
  }),
});

// Bhagavad Gita Agent Config
export const BhagavadGitaAgentConfigSchema = BaseAgentConfigSchema.extend({
  config: z.object({
    prompts: z.object({
      systemPrompt: z.string(),
      userPromptTemplate: z.string(),
    }),
  }),
});

// Main Agents Configuration
export const AgentsConfigSchema = z.object({
  version: z.string(),
  globalSettings: GlobalSettingsSchema,
  agents: z.object({
    'news-aggregator': NewsAgentConfigSchema,
    'diy-tutorials': DIYAgentConfigSchema,
    'bhagavad-gita': BhagavadGitaAgentConfigSchema,
  }),
  secretsFile: z.string(),
});

// Secrets Configuration
export const SecretsSchema = z.object({
  ai: z.object({
    google: z.object({
      apiKey: z.string(),
    }),
    groq: z.object({
      apiKey: z.string(),
    }),
    openai: z.object({
      apiKey: z.string(),
    }),
  }),
  social: z.object({
    reddit: z.object({
      clientId: z.string(),
      clientSecret: z.string(),
      userAgent: z.string(),
    }),
    stackexchange: z.object({
      apiKey: z.string(),
    }),
  }),
  email: z.object({
    formsubmit: z.object({
      email: z.string().email(),
    }),
  }),
});

// Type exports
export type AIModelConfig = z.infer<typeof AIModelConfigSchema>;
export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;
export type NewsAgentConfig = z.infer<typeof NewsAgentConfigSchema>;
export type DIYAgentConfig = z.infer<typeof DIYAgentConfigSchema>;
export type BhagavadGitaAgentConfig = z.infer<typeof BhagavadGitaAgentConfigSchema>;
export type AgentsConfig = z.infer<typeof AgentsConfigSchema>;
export type Secrets = z.infer<typeof SecretsSchema>;
