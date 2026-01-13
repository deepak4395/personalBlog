import { writeFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { resolve, join } from 'path';
import {
  configLoader,
  AIClient,
  logger,
  NewsPost,
  generateMarkdown,
  generateFilename,
  validateMarkdown,
} from '@personalBlog/core';
import { RSSFetcher, HackerNewsClient } from './sources/index.js';
import { ContentDeduplicator, ContentRanker } from './processors/index.js';
import { BlogGenerator } from './generator/index.js';
import { NewsArticle, ProcessedArticle } from './types.js';

/**
 * News Aggregator Agent
 * Fetches latest tech news, generates blog posts using AI
 */

export class NewsAggregatorAgent {
  private rssFetcher: RSSFetcher;
  private hnClient: HackerNewsClient;
  private deduplicator: ContentDeduplicator;
  private ranker: ContentRanker;
  private blogGenerator: BlogGenerator;
  private aiClient: AIClient;

  constructor() {
    this.rssFetcher = new RSSFetcher();
    this.hnClient = new HackerNewsClient();
    this.deduplicator = new ContentDeduplicator(7); // 7-day window
    this.ranker = new ContentRanker();
    this.aiClient = new AIClient();

    // Load config
    const config = configLoader.loadAgentsConfig();
    const agentConfig = config.agents['news-aggregator'];

    this.blogGenerator = new BlogGenerator(
      this.aiClient,
      agentConfig.config.prompts.systemPrompt,
      agentConfig.config.prompts.userPromptTemplate
    );
  }

  /**
   * Run the news aggregator agent
   */
  async run(): Promise<void> {
    try {
      logger.info('Starting News Aggregator Agent...');

      const config = configLoader.loadAgentsConfig();
      const agentConfig = config.agents['news-aggregator'];

      if (!agentConfig.enabled) {
        logger.warn('News aggregator agent is disabled');
        return;
      }

      // Step 1: Fetch articles from all sources
      logger.info('Fetching articles from sources...');
      const articles = await this.fetchArticles();

      if (articles.length === 0) {
        logger.warn('No articles fetched');
        return;
      }

      // Step 2: Deduplicate
      logger.info('Deduplicating articles...');
      const processed = this.deduplicator.processArticles(articles);

      // Step 3: Rank by relevance
      logger.info('Ranking articles...');
      const ranked = this.ranker.rankArticles(
        processed,
        agentConfig.config.minRelevanceScore
      );

      if (ranked.length === 0) {
        logger.warn('No articles passed relevance filter');
        return;
      }

      logger.info(`Top ${Math.min(5, ranked.length)} articles:`);
      ranked.slice(0, 5).forEach((article, index) => {
        logger.info(
          `  ${index + 1}. ${article.title} (score: ${article.relevanceScore.toFixed(2)})`
        );
      });

      // Step 4: Generate blog posts
      logger.info('Generating blog posts...');
      const tier = agentConfig.aiModel || 'tier1';
      
      // Filter out articles that already have posts and get existing blog context
      const { filteredArticles, existingBlogContext } = await this.filterExistingPosts(ranked, agentConfig.outputPath);
      if (filteredArticles.length === 0) {
        logger.info('All top articles already have blog posts');
        return;
      }
      
      const generatedPosts = await this.blogGenerator.generatePosts(
        filteredArticles,
        agentConfig.config.maxArticlesPerRun,
        tier,
        existingBlogContext
      );

      // Step 5: Save blog posts
      logger.info('Saving blog posts...');
      const savedCount = await this.savePosts(generatedPosts, agentConfig.outputPath);

      logger.info(`✅ News aggregator completed: ${savedCount} posts saved`);

      // Show usage stats
      const usageStats = this.aiClient.getUsageStats();
      logger.info('AI usage:', usageStats);
    } catch (error: any) {
      logger.error('News aggregator failed:', error);
      throw error;
    }
  }

  /**
   * Fetch articles from all configured sources
   */
  private async fetchArticles(): Promise<NewsArticle[]> {
    const config = configLoader.loadAgentsConfig();
    const agentConfig = config.agents['news-aggregator'];
    const allArticles: NewsArticle[] = [];

    // Fetch from RSS feeds
    if (agentConfig.config.sources.rss) {
      const rssArticles = await this.rssFetcher.fetchMultipleFeeds(
        agentConfig.config.sources.rss
      );
      allArticles.push(...rssArticles);
    }

    // Fetch from Hacker News
    if (agentConfig.config.sources.apis.hackernews.enabled) {
      const hnConfig = agentConfig.config.sources.apis.hackernews;
      const hnStories = await this.hnClient.searchStories(
        hnConfig.keywords,
        hnConfig.minScore,
        hnConfig.maxResults
      );

      // Convert HN stories to NewsArticle format
      const hnArticles: NewsArticle[] = hnStories.map((story) => ({
        title: story.title,
        url: story.url,
        source: 'https://news.ycombinator.com',
        siteName: 'Hacker News',
        publishedDate: story.publishedDate,
        summary: '',
        content: story.title,
        categories: ['tech'],
        weight: 1.0,
      }));

      allArticles.push(...hnArticles);
    }

    logger.info(`Fetched ${allArticles.length} total articles`);
    return allArticles;
  }

  /**
   * Filter out articles that already have published posts
   */
  private async filterExistingPosts(
    articles: ProcessedArticle[],
    outputPath: string
  ): Promise<{ filteredArticles: ProcessedArticle[]; existingBlogContext: Array<{ title: string; url: string }> }> {
    const config = configLoader.loadAgentsConfig();
    const contentPath = resolve(process.cwd(), config.globalSettings.contentPath, outputPath);

    if (!existsSync(contentPath)) {
      return { filteredArticles: articles, existingBlogContext: [] };
    }

    // Read existing post files
    const existingFiles = readdirSync(contentPath).filter(file => file.endsWith('.md') && file !== '.gitkeep.md');
    const existingBlogContext: Array<{ title: string; url: string }> = [];
    const existingTitlesSet = new Set<string>();
    const existingUrls = new Set<string>();

    for (const file of existingFiles) {
      const filePath = join(contentPath, file);
      const content = readFileSync(filePath, 'utf-8');
      
      // Extract title from frontmatter
      const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
      let title = '';
      if (titleMatch) {
        title = titleMatch[1].trim();
        existingTitlesSet.add(title.toLowerCase());
      }
      
      // Extract source URL from frontmatter
      const urlMatch = content.match(/url:\s*["']?(.+?)["']?\s*$/m);
      let url = '';
      if (urlMatch) {
        url = urlMatch[1].trim();
        existingUrls.add(url);
      }
      
      // Add to context if we have both title and URL
      if (title && url) {
        existingBlogContext.push({ title, url });
      }
    }

    logger.info(`Found ${existingBlogContext.length} existing blog posts to use as context`);

    // Filter out articles with duplicate URLs or similar titles
    const filtered = articles.filter(article => {
      // Check for exact URL match (most reliable)
      if (existingUrls.has(article.url)) {
        logger.info(`Skipping duplicate article: ${article.title} (same source URL already posted)`);
        return false;
      }
      
      const normalizedTitle = article.title.toLowerCase().trim();
      
      // Check for exact match or significant overlap
      for (const existingTitle of existingTitlesSet) {
        // If 60% of words match, consider it duplicate
        const articleWords = normalizedTitle.split(/\s+/).filter(w => w.length > 3); // Ignore short words
        const existingWords = existingTitle.split(/\s+/).filter(w => w.length > 3);
        const commonWords = articleWords.filter(word => existingWords.includes(word));
        
        if (articleWords.length > 0 && commonWords.length / articleWords.length > 0.6) {
          logger.info(`Skipping duplicate article: ${article.title} (matches existing post)`);
          return false;
        }
      }
      
      return true;
    });

    logger.info(`Filtered ${articles.length - filtered.length} duplicate articles`);
    return { filteredArticles: filtered, existingBlogContext };
  }

  /**
   * Save generated posts to markdown files
   */
  private async savePosts(
    generatedPosts: Array<{ article: ProcessedArticle; post: any }>,
    outputPath: string
  ): Promise<number> {
    const config = configLoader.loadAgentsConfig();
    const contentPath = resolve(process.cwd(), config.globalSettings.contentPath, outputPath);

    logger.info(`Saving posts to: ${contentPath}`);
    logger.info(`Current working directory: ${process.cwd()}`);

    // Ensure directory exists
    if (!existsSync(contentPath)) {
      mkdirSync(contentPath, { recursive: true });
    }

    let savedCount = 0;

    for (const { article, post } of generatedPosts) {
      try {
        // Create frontmatter
        const frontmatter: NewsPost = {
          title: post.title,
          description: post.description,
          pubDate: new Date().toISOString(),
          tags: post.tags,
          category: post.category,
          aiGenerated: true,
          sources: [
            {
              title: article.title,
              url: article.url,
              site: article.siteName,
            },
          ],
        };

        // Generate markdown
        const markdown = generateMarkdown({
          frontmatter,
          content: post.content,
        });

        // Validate
        const validation = validateMarkdown(markdown);
        if (!validation.valid) {
          logger.error(`Invalid markdown for ${post.title}:`);
          validation.errors.forEach((err, idx) => {
            logger.error(`  Error ${idx + 1}: ${err}`);
          });
          logger.error('First 500 chars of generated markdown:', markdown.substring(0, 500));
          continue;
        }

        // Save to file
        const filename = generateFilename(new Date(), post.title);
        const filepath = join(contentPath, filename);

        writeFileSync(filepath, markdown, 'utf-8');
        logger.info(`Saved: ${filename}`);
        logger.info(`Full path: ${filepath}`);

        savedCount++;
      } catch (error: any) {
        logger.error(`Failed to save post ${post.title}:`, error);
      }
    }

    return savedCount;
  }
}

// Export for CLI
export async function runNewsAgent(): Promise<void> {
  const agent = new NewsAggregatorAgent();
  await agent.run();
}
