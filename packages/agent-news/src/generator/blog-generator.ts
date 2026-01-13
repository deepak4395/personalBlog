import { AIClient, logger } from '@personalBlog/core';
import { ProcessedArticle } from '../types.js';

/**
 * Blog Post Generator using AI
 */

export interface GeneratedBlogPost {
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
}

export class BlogGenerator {
  constructor(
    private readonly aiClient: AIClient,
    private readonly systemPrompt: string,
    private readonly userPromptTemplate: string
  ) {}

  /**
   * Generate a blog post from an article
   */
  async generatePost(
    article: ProcessedArticle, 
    tier: 'tier1' | 'tier2' | 'tier3' = 'tier1',
    existingBlogContext: Array<{ title: string; url: string }> = []
  ): Promise<GeneratedBlogPost> {
    try {
      logger.info(`Generating blog post for: ${article.title}`);

      // Build the user prompt with existing blog context
      let userPrompt = this.userPromptTemplate
        .replace('{title}', article.title)
        .replace('{source}', article.siteName)
        .replace('{url}', article.url)
        .replace('{content}', article.content || article.summary || '');

      // Add existing blog context to avoid duplication
      if (existingBlogContext.length > 0) {
        const contextList = existingBlogContext
          .slice(-10) // Last 10 posts
          .map((post, i) => `${i + 1}. "${post.title}" (source: ${post.url})`)
          .join('\n');
        
        const existingContext = `\n\nIMPORTANT - We already have these blog posts:\n${contextList}\n\nMake sure to:\n1. Check if the source URL matches any existing post - if yes, SKIP this article\n2. Provide NEW insights and a DIFFERENT perspective than these existing posts\n3. Focus on unique angles not covered before`;
        userPrompt += existingContext;
      }

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
        // Remove markdown code blocks if present (```json ... ``` or ``` ... ```)
        let jsonText = result.content.trim();
        const codeBlockMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1].trim();
        }
        
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        logger.error(`Failed to parse JSON response for ${article.title}`);
        logger.error('Raw response (first 2000 chars):', result.content.substring(0, 2000));
        logger.error('Parse error:', parseError instanceof Error ? parseError.message : 'Unknown error');
        throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }

      const post: GeneratedBlogPost = {
        title: parsed.title || article.title,
        description: parsed.description || '',
        content: parsed.content || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        category: parsed.category || 'news',
      };

      // Debug logging for empty content
      if (!post.content || post.content.length < 100) {
        logger.warn(`Generated content is too short for ${article.title}`);
        logger.warn(`Parsed JSON keys: ${Object.keys(parsed).join(', ')}`);
        logger.warn(`Content length: ${post.content.length}`);
        logger.warn(`Content value: ${post.content.substring(0, 200)}`);
      }

      logger.info(`Blog post generated: "${post.title}" (${result.usage?.totalTokens || 0} tokens)`);

      return post;
    } catch (error: any) {
      logger.error(`Failed to generate blog post for ${article.title}:`, error);
      throw error;
    }
  }

  /**
   * Generate multiple blog posts
   */
  async generatePosts(
    articles: ProcessedArticle[],
    maxPosts: number,
    tier: 'tier1' | 'tier2' | 'tier3' = 'tier1',
    existingBlogContext: Array<{ title: string; url: string }> = []
  ): Promise<Array<{ article: ProcessedArticle; post: GeneratedBlogPost }>> {
    const results: Array<{ article: ProcessedArticle; post: GeneratedBlogPost }> = [];

    for (let i = 0; i < Math.min(articles.length, maxPosts); i++) {
      const article = articles[i];

      try {
        const post = await this.generatePost(article, tier, existingBlogContext);
        results.push({ article, post });

        // Delay to avoid hitting 2K RPM limit (30 req/min = 2s delay)
        await this.sleep(5000);
      } catch (error) {
        logger.error(`Skipping article ${article.title} due to generation error`);
      }
    }

    return results;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
