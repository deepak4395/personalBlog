import FeedParser from 'feedparser';
import axios from 'axios';
import { Readable } from 'stream';
import { logger } from '@personalBlog/core';
import { NewsArticle } from '../types.js';

/**
 * RSS Feed Fetcher
 */

export interface RSSFeedConfig {
  url: string;
  name: string;
  weight: number;
  categories: string[];
}

export class RSSFetcher {
  /**
   * Fetch articles from an RSS feed
   */
  async fetchFeed(config: RSSFeedConfig): Promise<NewsArticle[]> {
    try {
      logger.info(`Fetching RSS feed: ${config.name} (${config.url})`);

      const response = await axios.get(config.url, {
        responseType: 'stream',
        headers: {
          'User-Agent': 'PersonalBlog/1.0 (Embedded Systems News Aggregator)',
        },
        timeout: 30000,
      });

      const articles = await this.parseRSSStream(response.data, config);

      logger.info(`Fetched ${articles.length} articles from ${config.name}`);
      return articles;
    } catch (error: any) {
      logger.error(`Failed to fetch RSS feed ${config.name}:`, error.message);
      return [];
    }
  }

  /**
   * Parse RSS stream into articles
   */
  private async parseRSSStream(
    stream: Readable,
    config: RSSFeedConfig
  ): Promise<NewsArticle[]> {
    return new Promise((resolve, reject) => {
      const articles: NewsArticle[] = [];
      const feedparser = new FeedParser({});

      stream.pipe(feedparser);

      feedparser.on('error', (error: Error) => {
        logger.error(`FeedParser error for ${config.name}:`, error);
        reject(error);
      });

      feedparser.on('readable', function (this: any) {
        let item;
        while ((item = this.read())) {
          articles.push({
            title: item.title || 'Untitled',
            url: item.link || item.guid || '',
            source: config.url,
            siteName: config.name,
            publishedDate: item.pubdate || new Date(),
            summary: item.summary || item.description || '',
            content: item.description || item.summary || '',
            categories: config.categories,
            weight: config.weight,
          });
        }
      });

      feedparser.on('end', () => {
        resolve(articles);
      });
    });
  }

  /**
   * Fetch from multiple feeds in parallel
   */
  async fetchMultipleFeeds(configs: RSSFeedConfig[]): Promise<NewsArticle[]> {
    const results = await Promise.allSettled(configs.map((config) => this.fetchFeed(config)));

    const allArticles = results
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => (result as PromiseFulfilledResult<NewsArticle[]>).value);

    return allArticles;
  }
}
