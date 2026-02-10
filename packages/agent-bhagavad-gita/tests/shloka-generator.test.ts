import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShlokaGenerator } from '../src/generator/shloka-generator.js';
import { AIClient } from '@personalBlog/core';

// Mock AIClient
vi.mock('@personalBlog/core', () => ({
  AIClient: vi.fn(),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('ShlokaGenerator', () => {
  let mockAIClient: any;
  let generator: ShlokaGenerator;
  const systemPrompt = 'You are a Bhagavad Gita expert.';
  const userPromptTemplate = 'Generate shloka for Chapter {chapter}, Verse {verse} from {chapterName}';

  beforeEach(() => {
    vi.clearAllMocks();

    mockAIClient = {
      generate: vi.fn(),
    };

    generator = new ShlokaGenerator(mockAIClient, systemPrompt, userPromptTemplate);
  });

  describe('generatePost', () => {
    it('should generate a complete shloka post with all required fields', async () => {
      const mockResponse = {
        content: JSON.stringify({
          title: 'Bhagavad Gita: Chapter 1, Verse 1',
          description: 'First verse of the Gita',
          sanskrit: 'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः',
          transliteration: 'dharmakṣetre kurukṣetre samavetā yuyutsavaḥ',
          translation: 'On the holy plain of Kurukshetra',
          content: 'Detailed explanation of the verse with more than 100 characters to ensure proper validation and testing.',
          chapterName: 'Arjuna Vishada Yoga',
          tags: ['Bhagavad Gita', 'Chapter 1'],
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const result = await generator.generatePost(
        { chapter: 1, verse: 1 },
        null,
        { chapter: 1, verse: 2 }
      );

      expect(result).toBeDefined();
      expect(result.chapter).toBe(1);
      expect(result.verse).toBe(1);
      expect(result.sanskrit).toBe('धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः');
      expect(result.translation).toBe('On the holy plain of Kurukshetra');
      expect(result.content).toContain('Detailed explanation');
      expect(result.category).toBe('bhagavad-gita');
    });

    it('should handle JSON response wrapped in markdown code blocks', async () => {
      const mockResponse = {
        content: '```json\n' + JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'English translation',
          content: 'Detailed explanation with sufficient length to pass validation requirements for proper testing.',
        }) + '\n```',
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const result = await generator.generatePost({ chapter: 1, verse: 1 }, null, null);

      expect(result.sanskrit).toBe('Sanskrit text');
      expect(result.translation).toBe('English translation');
    });

    it('should handle JSON response without language specifier in code block', async () => {
      const mockResponse = {
        content: '```\n' + JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'English translation',
          content: 'Detailed explanation with sufficient length to pass validation requirements for proper testing.',
        }) + '\n```',
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const result = await generator.generatePost({ chapter: 1, verse: 1 }, null, null);

      expect(result.sanskrit).toBe('Sanskrit text');
    });

    it('should extract JSON from mixed content', async () => {
      const mockResponse = {
        content: 'Here is the JSON:\n' + JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'English translation',
          content: 'Detailed explanation with sufficient length to pass validation requirements for proper testing.',
        }) + '\nHope this helps!',
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const result = await generator.generatePost({ chapter: 1, verse: 1 }, null, null);

      expect(result.sanskrit).toBe('Sanskrit text');
    });

    it('should throw error when required fields are missing', async () => {
      vi.useFakeTimers();
      
      const mockResponse = {
        content: JSON.stringify({
          title: 'Test',
          // Missing sanskrit, translation, content
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      // Start the generation (it will retry 3 times)
      const generatePromise = generator.generatePost({ chapter: 1, verse: 1 }, null, null);
      
      // Wait for all retries (2^1 * 1000 + 2^2 * 1000 = 2000 + 4000 = 6000ms)
      await vi.advanceTimersByTimeAsync(10000);
      
      // Wait a bit more for promise resolution
      await vi.runAllTimersAsync();

      await expect(generatePromise).rejects.toThrow('missing required fields');
      
      vi.useRealTimers();
    });

    it('should validate sanskrit field is present', async () => {
      vi.useFakeTimers();
      
      const mockResponse = {
        content: JSON.stringify({
          translation: 'Translation',
          content: 'Content with sufficient length for validation',
          // Missing sanskrit
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const generatePromise = generator.generatePost({ chapter: 1, verse: 1 }, null, null);
      
      await vi.runAllTimersAsync();

      await expect(generatePromise).rejects.toThrow('sanskrit');
      
      vi.useRealTimers();
    });

    it('should validate translation field is present', async () => {
      vi.useFakeTimers();
      
      const mockResponse = {
        content: JSON.stringify({
          sanskrit: 'Sanskrit text',
          content: 'Content with sufficient length for validation',
          // Missing translation
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const generatePromise = generator.generatePost({ chapter: 1, verse: 1 }, null, null);
      
      await vi.runAllTimersAsync();

      await expect(generatePromise).rejects.toThrow('translation');
      
      vi.useRealTimers();
    });

    it('should validate content field is present', async () => {
      vi.useFakeTimers();
      
      const mockResponse = {
        content: JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'Translation',
          // Missing content
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const generatePromise = generator.generatePost({ chapter: 1, verse: 1 }, null, null);
      
      await vi.runAllTimersAsync();

      await expect(generatePromise).rejects.toThrow('content');
      
      vi.useRealTimers();
    });

    it('should use defaults for optional fields', async () => {
      const mockResponse = {
        content: JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'Translation',
          content: 'Content with sufficient length for validation',
          // No title, description, chapterName, tags
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const result = await generator.generatePost({ chapter: 1, verse: 1 }, null, null);

      expect(result.title).toBe('Bhagavad Gita: Chapter 1, Verse 1');
      expect(result.description).toBeTruthy();
      expect(result.tags).toEqual(['Bhagavad Gita', 'Arjuna Vishada Yoga']);
    });

    it('should set previousShloka and nextShloka correctly', async () => {
      const mockResponse = {
        content: JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'Translation',
          content: 'Content with sufficient length for validation',
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const result = await generator.generatePost(
        { chapter: 2, verse: 10 },
        { chapter: 2, verse: 9 },
        { chapter: 2, verse: 11 }
      );

      expect(result.previousShloka).toEqual({ chapter: 2, verse: 9 });
      expect(result.nextShloka).toEqual({ chapter: 2, verse: 11 });
    });

    it('should handle null for first shloka previousShloka', async () => {
      const mockResponse = {
        content: JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'Translation',
          content: 'Content with sufficient length for validation',
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const result = await generator.generatePost(
        { chapter: 1, verse: 1 },
        null,
        { chapter: 1, verse: 2 }
      );

      expect(result.previousShloka).toBeNull();
    });

    it('should handle null for last shloka nextShloka', async () => {
      const mockResponse = {
        content: JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'Translation',
          content: 'Content with sufficient length for validation',
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      const result = await generator.generatePost(
        { chapter: 18, verse: 78 },
        { chapter: 18, verse: 77 },
        null
      );

      expect(result.nextShloka).toBeNull();
    });

    it('should retry on failure with exponential backoff', async () => {
      vi.useFakeTimers();

      mockAIClient.generate
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValue({
          content: JSON.stringify({
            sanskrit: 'Sanskrit text',
            translation: 'Translation',
            content: 'Content with sufficient length for validation',
          }),
          usage: { totalTokens: 500 },
        });

      const promise = generator.generatePost({ chapter: 1, verse: 1 }, null, null);

      // Fast-forward timers for retries
      await vi.advanceTimersByTimeAsync(2000); // First retry after 2s
      await vi.advanceTimersByTimeAsync(4000); // Second retry after 4s

      const result = await promise;

      expect(result).toBeDefined();
      expect(mockAIClient.generate).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('should throw error after all retries fail', async () => {
      vi.useFakeTimers();

      mockAIClient.generate.mockRejectedValue(new Error('Generation failed'));

      const generatePromise = generator.generatePost({ chapter: 1, verse: 1 }, null, null);

      // Wait for all timers to complete
      const promiseAndTimers = Promise.all([
        (async () => {
          await vi.advanceTimersByTimeAsync(2000); // First retry
          await vi.advanceTimersByTimeAsync(4000); // Second retry
        })(),
        generatePromise.catch(err => err) // Catch to prevent unhandled rejection
      ]);

      await promiseAndTimers;

      // Now check the actual promise rejects
      await expect(generatePromise).rejects.toThrow('Generation failed');
      expect(mockAIClient.generate).toHaveBeenCalledTimes(3);

      vi.useRealTimers();
    });

    it('should use correct tier parameter', async () => {
      const mockResponse = {
        content: JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'Translation',
          content: 'Content with sufficient length for validation',
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      await generator.generatePost({ chapter: 1, verse: 1 }, null, null, 'tier2');

      expect(mockAIClient.generate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ tier: 'tier2' })
      );
    });

    it('should include systemPrompt and responseFormat in options', async () => {
      const mockResponse = {
        content: JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'Translation',
          content: 'Content with sufficient length for validation',
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      await generator.generatePost({ chapter: 1, verse: 1 }, null, null);

      expect(mockAIClient.generate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          systemPrompt: systemPrompt,
          responseFormat: 'json',
          temperature: 0.7,
        })
      );
    });

    it('should replace placeholders in user prompt template', async () => {
      const mockResponse = {
        content: JSON.stringify({
          sanskrit: 'Sanskrit text',
          translation: 'Translation',
          content: 'Content with sufficient length for validation',
        }),
        usage: { totalTokens: 500 },
      };

      mockAIClient.generate.mockResolvedValue(mockResponse);

      await generator.generatePost({ chapter: 5, verse: 15 }, null, null);

      expect(mockAIClient.generate).toHaveBeenCalledWith(
        'Generate shloka for Chapter 5, Verse 15 from Karma Sanyasa Yoga',
        expect.any(Object)
      );
    });
  });
});
