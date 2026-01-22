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
   * Generate a blog post for a single shloka with retry logic
   */
  async generatePost(
    shlokaRef: ShlokaReference,
    previousShloka: ShlokaReference | null,
    nextShloka: ShlokaReference | null,
    tier: 'tier1' | 'tier2' | 'tier3' = 'tier1'
  ): Promise<GeneratedShlokaPost> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Generating blog post for Bhagavad Gita Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse} (attempt ${attempt}/${maxRetries})`);

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
          
          // Handle various markdown code block formats
          const codeBlockMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
          if (codeBlockMatch) {
            jsonText = codeBlockMatch[1].trim();
          }
          
          // Also try to extract JSON if it's embedded in other text
          const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }

          parsed = JSON.parse(jsonText);
        } catch (parseError) {
          logger.error(`Failed to parse JSON response for Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse} (attempt ${attempt})`);
          logger.error('Raw response (first 2000 chars):', result.content.substring(0, 2000));
          throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }

        // Validate required fields with detailed logging
        const missingFields: string[] = [];
        if (!parsed.sanskrit) missingFields.push('sanskrit');
        if (!parsed.translation) missingFields.push('translation');
        if (!parsed.content) missingFields.push('content');
        
        if (missingFields.length > 0) {
          logger.error(`Missing required fields: ${missingFields.join(', ')}`);
          logger.error('Parsed object keys:', Object.keys(parsed).join(', '));
          throw new Error(`Generated shloka missing required fields: ${missingFields.join(', ')}`);
        }

        const post: GeneratedShlokaPost = {
          title: parsed.title || `Bhagavad Gita: Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse}`,
          description: parsed.description || parsed.translation?.substring(0, 160) || '',
          content: parsed.content || '',
          chapter: shlokaRef.chapter,
          verse: shlokaRef.verse,
          chapterName: parsed.chapterName || chapterName || `Chapter ${shlokaRef.chapter}`,
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
        lastError = error;
        logger.error(`Attempt ${attempt} failed for Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse}:`, error.message);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const waitTime = Math.pow(2, attempt) * 1000;
          logger.info(`Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed
    logger.error(`Failed to generate shloka post for Chapter ${shlokaRef.chapter}, Verse ${shlokaRef.verse} after ${maxRetries} attempts`);
    throw lastError || new Error('Generation failed after all retries');
  }
}