import axios from 'axios';
import { logger } from '@personalBlog/core';

/**
 * Hacker News API Client
 */

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  time: number;
  by: string;
}

export class HackerNewsClient {
  private readonly apiBase = 'https://hn.algolia.com/api/v1';

  async searchStories(
    keywords: string[],
    minScore: number = 50,
    maxResults: number = 10
  ): Promise<
    Array<{
      title: string;
      url: string;
      score: number;
      publishedDate: Date;
    }>
  > {
    try {
      const query = keywords.join(' OR ');
      logger.info(`Searching Hacker News for: ${query}`);

      const response = await axios.get(`${this.apiBase}/search`, {
        params: {
          query,
          tags: 'story',
          hitsPerPage: maxResults * 2, // Get extra to filter by score
        },
      });

      const hits = response.data.hits || [];

      const stories = hits
        .filter((hit: any) => {
          // Filter by score and ensure it has a URL
          return hit.points >= minScore && hit.url;
        })
        .slice(0, maxResults)
        .map((hit: any) => ({
          title: hit.title,
          url: hit.url,
          score: hit.points,
          publishedDate: new Date(hit.created_at),
        }));

      logger.info(`Found ${stories.length} Hacker News stories`);
      return stories;
    } catch (error: any) {
      logger.error('Failed to fetch from Hacker News:', error);
      return [];
    }
  }
}
