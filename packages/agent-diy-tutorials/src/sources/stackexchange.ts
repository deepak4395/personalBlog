import axios from 'axios';
import { logger, configLoader } from '@personalBlog/core';
import { ForumPost } from '../types.js';

/**
 * Stack Exchange API Client
 */

export interface StackExchangeSiteConfig {
  name: string;
  tags: string[];
  minScore: number;
}

export class StackExchangeClient {
  private readonly apiBase = 'https://api.stackexchange.com/2.3';
  private apiKey: string;

  constructor() {
    const secrets = configLoader.loadSecrets();
    this.apiKey = secrets.social.stackexchange.apiKey;
  }

  /**
   * Fetch top questions from a Stack Exchange site
   */
  async fetchTopQuestions(
    siteName: string,
    tags: string[],
    minScore: number = 50,
    pageSize: number = 20
  ): Promise<ForumPost[]> {
    try {
      logger.info(`Fetching questions from ${siteName} with tags: ${tags.join(', ')}`);

      const response = await axios.get(`${this.apiBase}/questions`, {
        params: {
          site: siteName,
          tagged: tags.join(';'),
          sort: 'votes',
          order: 'desc',
          pagesize: pageSize,
          filter: 'withbody',
          key: this.apiKey,
        },
      });

      const questions = response.data.items || [];

      const forumPosts: ForumPost[] = questions
        .filter((q: any) => q.score >= minScore && q.is_answered)
        .map((q: any) => ({
          title: q.title,
          url: q.link,
          site: `Stack Exchange - ${siteName}`,
          score: q.score,
          author: q.owner.display_name || 'Anonymous',
          publishedDate: new Date(q.creation_date * 1000),
          content: this.stripHtml(q.body || ''),
          comments: q.answer_count,
        }));

      logger.info(`Found ${forumPosts.length} questions from ${siteName}`);
      return forumPosts;
    } catch (error: any) {
      logger.error(`Failed to fetch from ${siteName}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch from multiple Stack Exchange sites
   */
  async fetchFromMultipleSites(configs: StackExchangeSiteConfig[]): Promise<ForumPost[]> {
    const allPosts: ForumPost[] = [];

    for (const config of configs) {
      const posts = await this.fetchTopQuestions(
        config.name,
        config.tags,
        config.minScore,
        20
      );
      allPosts.push(...posts);

      // Rate limiting delay
      await this.sleep(1000);
    }

    return allPosts;
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
