import Snoowrap from 'snoowrap';
import { logger, configLoader } from '@personalBlog/core';
import { ForumPost } from '../types.js';

/**
 * Reddit API Client for fetching DIY posts
 */

export interface SubredditConfig {
  name: string;
  weight: number;
  minUpvotes: number;
}

export class RedditClient {
  private client: Snoowrap;

  constructor() {
    const secrets = configLoader.loadSecrets();

    this.client = new Snoowrap({
      userAgent: secrets.social.reddit.userAgent,
      clientId: secrets.social.reddit.clientId,
      clientSecret: secrets.social.reddit.clientSecret,
      refreshToken: '', // Not needed for read-only access
    });
  }

  /**
   * Fetch top posts from a subreddit
   */
  async fetchTopPosts(
    subredditName: string,
    timeFrame: 'day' | 'week' | 'month' | 'year' = 'month',
    minUpvotes: number = 100,
    limit: number = 20
  ): Promise<ForumPost[]> {
    try {
      logger.info(`Fetching top posts from r/${subredditName}`);

      const subreddit = this.client.getSubreddit(subredditName);
      const posts = await subreddit.getTop({ time: timeFrame, limit });

      const forumPosts: ForumPost[] = posts
        .filter((post: any) => post.score >= minUpvotes && !post.is_self === false)
        .map((post: any) => ({
          title: post.title,
          url: `https://reddit.com${post.permalink}`,
          site: `Reddit - r/${subredditName}`,
          score: post.score,
          author: post.author.name,
          publishedDate: new Date(post.created_utc * 1000),
          content: post.selftext || post.title,
          comments: post.num_comments,
        }));

      logger.info(`Found ${forumPosts.length} posts from r/${subredditName}`);
      return forumPosts;
    } catch (error: any) {
      logger.error(`Failed to fetch from r/${subredditName}:`, error.message);
      return [];
    }
  }

  /**
   * Fetch from multiple subreddits
   */
  async fetchFromMultipleSubreddits(
    configs: SubredditConfig[],
    timeFrame: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<ForumPost[]> {
    const allPosts: ForumPost[] = [];

    for (const config of configs) {
      const posts = await this.fetchTopPosts(
        config.name,
        timeFrame,
        config.minUpvotes,
        20
      );
      allPosts.push(...posts);

      // Rate limiting delay
      await this.sleep(2000);
    }

    return allPosts;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
