import { NewsArticle, ProcessedArticle, ArticleDeduplicationCache } from '../types.js';
import { logger } from '@personalBlog/core';
import { subDays } from 'date-fns';

/**
 * Content Deduplicator
 * Removes duplicate articles based on URL and title similarity
 */

export class ContentDeduplicator {
  private cache: ArticleDeduplicationCache = {
    urls: new Set(),
    titles: new Map(),
  };

  constructor(private readonly windowDays: number = 7) {}

  /**
   * Check if an article is a duplicate
   */
  isDuplicate(article: NewsArticle): boolean {
    // Check URL
    if (this.cache.urls.has(article.url)) {
      return true;
    }

    // Check similar titles
    const normalizedTitle = this.normalizeTitle(article.title);
    const existingDate = this.cache.titles.get(normalizedTitle);

    if (existingDate) {
      // Consider duplicate if same title within the window
      const windowStart = subDays(new Date(), this.windowDays);
      if (existingDate >= windowStart) {
        return true;
      }
    }

    return false;
  }

  /**
   * Add article to cache
   */
  addToCache(article: NewsArticle): void {
    this.cache.urls.add(article.url);
    this.cache.titles.set(this.normalizeTitle(article.title), article.publishedDate);
  }

  /**
   * Process articles and mark duplicates
   */
  processArticles(articles: NewsArticle[]): ProcessedArticle[] {
    return articles.map((article) => {
      const isDuplicate = this.isDuplicate(article);

      if (!isDuplicate) {
        this.addToCache(article);
      }

      return {
        ...article,
        isDuplicate,
        relevanceScore: 0, // Will be set by ranker
        generatedSlug: '',
      } as ProcessedArticle;
    });
  }

  /**
   * Normalize title for comparison
   */
  private normalizeTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Clear old entries from cache
   */
  cleanCache(): void {
    const windowStart = subDays(new Date(), this.windowDays);

    // Remove old titles
    for (const [title, date] of this.cache.titles.entries()) {
      if (date < windowStart) {
        this.cache.titles.delete(title);
      }
    }

    logger.debug(
      `Cache cleaned: ${this.cache.urls.size} URLs, ${this.cache.titles.size} titles`
    );
  }
}
