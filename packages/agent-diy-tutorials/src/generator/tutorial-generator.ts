import { AIClient, logger } from '@personalBlog/core';
import { ForumPost, TutorialTopic, TutorialOutline, GeneratedTutorial } from '../types.js';

/**
 * Tutorial Generator using AI
 * Multi-phase generation: topic discovery -> outline -> tutorial writing
 */

export class TutorialGenerator {
  constructor(
    private readonly aiClient: AIClient,
    private readonly prompts: {
      topicDiscovery: string;
      tutorialOutline: string;
      tutorialWriter: string;
    }
  ) {}

  /**
   * Phase 1: Discover tutorial topics from forum posts
   */
  async discoverTopics(
    posts: ForumPost[],
    topicsPerRun: number,
    tier: 'tier1' | 'tier2' | 'tier3' = 'tier2'
  ): Promise<TutorialTopic[]> {
    try {
      logger.info('Discovering tutorial topics from forum posts...');

      // Summarize posts for AI
      const postsSummary = posts
        .slice(0, 50) // Limit to avoid token overflow
        .map((post, index) => {
          return `${index + 1}. "${post.title}" (${post.site}, score: ${post.score})
   ${post.content.substring(0, 200)}...`;
        })
        .join('\n\n');

      const prompt = `${this.prompts.topicDiscovery}

Forum Posts:
${postsSummary}

Return a JSON array of ${topicsPerRun} tutorial topics in this format:
[
  {
    "topic": "Topic name",
    "difficulty": "beginner|intermediate|advanced",
    "description": "What this tutorial will teach",
    "keywords": ["keyword1", "keyword2"]
  }
]`;

      const result = await this.aiClient.generate(prompt, {
        tier,
        responseFormat: 'json',
      });

      const topics = JSON.parse(result.content);

      // Match topics with relevant posts
      const tutorialTopics: TutorialTopic[] = topics.map((topic: any) => ({
        ...topic,
        relatedPosts: this.findRelatedPosts(posts, topic.keywords || []),
      }));

      logger.info(`Discovered ${tutorialTopics.length} tutorial topics`);
      return tutorialTopics;
    } catch (error: any) {
      logger.error('Failed to discover topics:', error);
      return [];
    }
  }

  /**
   * Phase 2: Generate tutorial outline
   */
  async generateOutline(
    topic: TutorialTopic,
    tier: 'tier1' | 'tier2' | 'tier3' = 'tier2'
  ): Promise<TutorialOutline> {
    try {
      logger.info(`Generating outline for: ${topic.topic}`);

      const prompt = this.prompts.tutorialOutline
        .replace('{topic}', topic.topic)
        .replace('{difficulty}', topic.difficulty);

      const result = await this.aiClient.generate(prompt, {
        tier,
        responseFormat: 'json',
      });

      const outline = JSON.parse(result.content);

      logger.info(`Generated outline with ${outline.sections?.length || 0} sections`);

      return {
        topic: topic.topic,
        difficulty: topic.difficulty,
        sections: outline.sections || [],
      };
    } catch (error: any) {
      logger.error(`Failed to generate outline for ${topic.topic}:`, error);
      throw error;
    }
  }

  /**
   * Phase 3: Write complete tutorial
   */
  async writeTutorial(
    topic: TutorialTopic,
    outline: TutorialOutline,
    tier: 'tier1' | 'tier2' | 'tier3' = 'tier2'
  ): Promise<GeneratedTutorial> {
    try {
      logger.info(`Writing tutorial: ${topic.topic}`);

      const outlineText = outline.sections
        .map((section, index) => `${index + 1}. ${section.title}\n   ${section.description}`)
        .join('\n');

      const sourcesText = topic.relatedPosts
        .slice(0, 5)
        .map((post) => `- ${post.title} (${post.url})`)
        .join('\n');

      const prompt = `Write a comprehensive embedded systems tutorial.

**Topic:** ${topic.topic}
**Difficulty:** ${topic.difficulty}
**Description:** ${topic.description}

**Outline:**
${outlineText}

**Reference Sources:**
${sourcesText}

${this.prompts.tutorialWriter}

Return a JSON object:
{
  "title": "Tutorial title (60-80 chars)",
  "description": "SEO description (150-160 chars)",
  "content": "Full markdown tutorial content",
  "tags": ["tag1", "tag2", "tag3"],
  "series": "Series name (optional)"
}`;

      const result = await this.aiClient.generate(prompt, {
        tier,
        responseFormat: 'json',
        temperature: 0.7,
        maxTokens: 12000,
      });

      const tutorial = JSON.parse(result.content);

      logger.info(`Tutorial written: "${tutorial.title}" (${result.usage?.totalTokens || 0} tokens)`);

      return {
        title: tutorial.title,
        description: tutorial.description,
        difficulty: topic.difficulty,
        content: tutorial.content,
        tags: tutorial.tags || [],
        series: tutorial.series,
      };
    } catch (error: any) {
      logger.error(`Failed to write tutorial for ${topic.topic}:`, error);
      throw error;
    }
  }

  /**
   * Generate complete tutorials (all phases)
   */
  async generateTutorials(
    posts: ForumPost[],
    topicsPerRun: number,
    tier: 'tier1' | 'tier2' | 'tier3' = 'tier2'
  ): Promise<Array<{ topic: TutorialTopic; tutorial: GeneratedTutorial }>> {
    const results: Array<{ topic: TutorialTopic; tutorial: GeneratedTutorial }> = [];

    // Phase 1: Discover topics
    const topics = await this.discoverTopics(posts, topicsPerRun, tier);

    if (topics.length === 0) {
      logger.warn('No topics discovered');
      return results;
    }

    // Process each topic
    for (const topic of topics) {
      try {
        // Phase 2: Generate outline
        const outline = await this.generateOutline(topic, tier);

        // Small delay
        await this.sleep(2000);

        // Phase 3: Write tutorial
        const tutorial = await this.writeTutorial(topic, outline, tier);

        results.push({ topic, tutorial });

        // Delay between tutorials
        await this.sleep(3000);
      } catch (error) {
        logger.error(`Skipping topic ${topic.topic} due to error`);
      }
    }

    return results;
  }

  /**
   * Find posts related to keywords
   */
  private findRelatedPosts(posts: ForumPost[], keywords: string[]): ForumPost[] {
    if (keywords.length === 0) {
      return posts.slice(0, 5);
    }

    const scored = posts.map((post) => {
      const text = `${post.title} ${post.content}`.toLowerCase();
      const matches = keywords.filter((keyword) =>
        text.includes(keyword.toLowerCase())
      );
      return { post, score: matches.length };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.post);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
