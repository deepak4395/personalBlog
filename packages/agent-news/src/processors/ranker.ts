import { ProcessedArticle } from '../types.js';
import { logger } from '@personalBlog/core';

/**
 * Content Ranker
 * Scores articles based on relevance, recency, and source weight
 */

export class ContentRanker {
  private readonly keywords: string[] = [
    'embedded',
    'microcontroller',
    'rtos',
    'firmware',
    'hardware',
    'iot',
    'esp32',
    'stm32',
    'arm cortex',
    'linux',
    'devops',
    'ci/cd',
  ];

  /**
   * Rank articles by relevance
   */
  rankArticles(articles: ProcessedArticle[], minScore: number = 0.5): ProcessedArticle[] {
    // Calculate relevance scores
    articles.forEach((article) => {
      article.relevanceScore = this.calculateRelevanceScore(article);
    });

    // Sort by relevance (descending)
    const ranked = articles
      .filter((article) => article.relevanceScore >= minScore && !article.isDuplicate)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    logger.info(
      `Ranked ${ranked.length} articles (filtered from ${articles.length} with min score ${minScore})`
    );

    return ranked;
  }

  /**
   * Calculate relevance score for an article
   */
  private calculateRelevanceScore(article: ProcessedArticle): number {
    let score = 0;

    // Keyword matching (0-50 points)
    const text = `${article.title} ${article.summary || ''} ${article.content}`.toLowerCase();
    const keywordMatches = this.keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
    score += Math.min(keywordMatches.length * 10, 50);

    // Source weight (0-30 points)
    score += article.weight * 10;

    // Recency (0-20 points)
    const ageInDays = (Date.now() - article.publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays <= 1) {
      score += 20;
    } else if (ageInDays <= 3) {
      score += 15;
    } else if (ageInDays <= 7) {
      score += 10;
    } else if (ageInDays <= 14) {
      score += 5;
    }

    // Normalize to 0-1
    return Math.min(score / 100, 1);
  }
}
