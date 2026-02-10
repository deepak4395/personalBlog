import { vi } from 'vitest';

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.GROQ_API_KEY = 'test-groq-key';
process.env.OPENAI_API_KEY = 'test-openai-key';

// Mock logger to avoid console output during tests
vi.mock('@personalBlog/core', async () => {
  const actual = await vi.importActual('@personalBlog/core');
  return {
    ...actual,
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
  };
});
