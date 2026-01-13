import { AIClient, logger } from '@personalBlog/core';
import { GeneratedShlokaPost, ShlokaReference, CHAPTER_NAMES } from '../types.js';

/**
 * Shloka Blog Post Generator using AI
 */

export class ShlokaGenerator {
  constructor(
    private readonly aiClient: AIClient,
    private readonly systemPrompt: string,
    private readonly userPromptTemplate: string
  ) {}

  /**
   * Generate a blog post for a single shloka
   */
  async generatePost(
    shlokaRef: ShlokaReference,
    previousShloka: ShlokaReference | null,
    nextShloka: ShlokaReference | null,
    tier: 'tier1' | 'tier2' | 'tier3' = 'tier1'
  ): Promise<GeneratedShlokaPost> {
    try {
      logger.info(`Generating blog post for Bhagavad Gita Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse}`);

      const chapterName = CHAPTER_NAMES[shlokaRef.chapter];

      // Build the user prompt
      const userPrompt = this.userPromptTemplate
        .replace('{chapter}', shlokaRef.chapter.toString())
        .replace('{verse}', shlokaRef.verse.toString())
        .replace('{chapterName}', chapterName);

      // Request JSON format
      const result = await this.aiClient.generate(userPrompt, {
        tier,
        systemPrompt: this.systemPrompt,
        responseFormat: 'json',
        temperature: 0.7,
      });

      // Parse JSON response
      let parsed;
      try {
        // Remove markdown code blocks if present
        let jsonText = result.content.trim();
        const codeBlockMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1].trim();
        }

        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        logger.error(`Failed to parse JSON response for Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse}`);
        logger.error('Raw response (first 2000 chars):', result.content.substring(0, 2000));
        throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      // Validate required fields
      if (!parsed.sanskrit || !parsed.translation || !parsed.content) {
        throw new Error('Generated shloka missing required fields (sanskrit, translation, or content)');
      }

      const post: GeneratedShlokaPost = {
        title: parsed.title || `Bhagavad Gita: Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse}`,
        description: parsed.description || parsed.translation?.substring(0, 160) || '',
        content: parsed.content || '',
        chapter: shlokaRef.chapter,
        verse: shlokaRef.verse,
        sanskrit: parsed.sanskrit || '',
        transliteration: parsed.transliteration || '',
        translation: parsed.translation || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['Bhagavad Gita', chapterName],
        category: 'bhagavad-gita',
        previousShloka,
        nextShloka,
      };

      logger.info(
        `Blog post generated for Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse} ` +
        `(${result.usage?.totalTokens || 0} tokens)`
      );

      return post;
    } catch (error: any) {
      logger.error(`Failed to generate shloka post for Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse}:`, error);
      throw error;
    }
  }
}
