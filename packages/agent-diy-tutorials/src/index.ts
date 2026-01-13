import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import {
  configLoader,
  AIClient,
  logger,
  TutorialPost,
  generateMarkdown,
  generateFilename,
  validateMarkdown,
} from '@personalBlog/core';
import { RedditClient, StackExchangeClient } from './sources/index.js';
import { TutorialGenerator } from './generator/index.js';
import { ForumPost, TutorialTopic } from './types.js';

/**
 * DIY Tutorials Agent
 * Researches forums, generates educational tutorial content
 */

export class DIYTutorialsAgent {
  private redditClient: RedditClient;
  private stackExchangeClient: StackExchangeClient;
  private tutorialGenerator: TutorialGenerator;
  private aiClient: AIClient;

  constructor() {
    this.redditClient = new RedditClient();
    this.stackExchangeClient = new StackExchangeClient();
    this.aiClient = new AIClient();

    // Load config
    const config = configLoader.loadAgentsConfig();
    const agentConfig = config.agents['diy-tutorials'];

    this.tutorialGenerator = new TutorialGenerator(this.aiClient, agentConfig.config.prompts);
  }

  /**
   * Run the DIY tutorials agent
   */
  async run(): Promise<void> {
    try {
      logger.info('Starting DIY Tutorials Agent...');

      const config = configLoader.loadAgentsConfig();
      const agentConfig = config.agents['diy-tutorials'];

      if (!agentConfig.enabled) {
        logger.warn('DIY tutorials agent is disabled');
        return;
      }

      // Step 1: Fetch posts from forums
      logger.info('Fetching posts from forums...');
      const posts = await this.fetchForumPosts();

      if (posts.length === 0) {
        logger.warn('No forum posts fetched');
        return;
      }

      logger.info(`Fetched ${posts.length} forum posts`);

      // Step 2: Generate tutorials
      logger.info('Generating tutorials...');
      const tier = agentConfig.aiModel || 'tier2';
      const generatedTutorials = await this.tutorialGenerator.generateTutorials(
        posts,
        agentConfig.config.topicsPerRun,
        tier
      );

      if (generatedTutorials.length === 0) {
        logger.warn('No tutorials generated');
        return;
      }

      // Step 3: Save tutorials
      logger.info('Saving tutorials...');
      const savedCount = await this.saveTutorials(generatedTutorials, agentConfig.outputPath);

      logger.info(`✅ DIY tutorials completed: ${savedCount} tutorials saved`);

      // Show usage stats
      const usageStats = this.aiClient.getUsageStats();
      logger.info('AI usage:', usageStats);
    } catch (error: any) {
      logger.error('DIY tutorials agent failed:', error);
      throw error;
    }
  }

  /**
   * Fetch posts from all configured forums
   */
  private async fetchForumPosts(): Promise<ForumPost[]> {
    const config = configLoader.loadAgentsConfig();
    const agentConfig = config.agents['diy-tutorials'];
    const allPosts: ForumPost[] = [];

    // Fetch from Reddit
    if (agentConfig.config.sources.reddit) {
      const redditConfig = agentConfig.config.sources.reddit;
      const redditPosts = await this.redditClient.fetchFromMultipleSubreddits(
        redditConfig.subreddits,
        redditConfig.timeFrame as any
      );
      allPosts.push(...redditPosts);
    }

    // Fetch from Stack Exchange
    if (agentConfig.config.sources.stackexchange) {
      const seConfig = agentConfig.config.sources.stackexchange;
      const sePosts = await this.stackExchangeClient.fetchFromMultipleSites(seConfig.sites);
      allPosts.push(...sePosts);
    }

    // Sort by score
    allPosts.sort((a, b) => b.score - a.score);

    return allPosts;
  }

  /**
   * Save generated tutorials to markdown files
   */
  private async saveTutorials(
    generatedTutorials: Array<{ topic: TutorialTopic; tutorial: any }>,
    outputPath: string
  ): Promise<number> {
    const config = configLoader.loadAgentsConfig();
    const contentPath = resolve(process.cwd(), config.globalSettings.contentPath, outputPath);

    // Ensure directory exists
    if (!existsSync(contentPath)) {
      mkdirSync(contentPath, { recursive: true });
    }

    let savedCount = 0;

    for (const { topic, tutorial } of generatedTutorials) {
      try {
        // Create frontmatter
        const frontmatter: TutorialPost = {
          title: tutorial.title,
          description: tutorial.description,
          pubDate: new Date().toISOString(),
          difficulty: tutorial.difficulty,
          tags: tutorial.tags,
          series: tutorial.series,
          category: 'tutorials',
          aiGenerated: true,
          sources: topic.relatedPosts.slice(0, 3).map((post) => ({
            title: post.title,
            url: post.url,
            site: post.site,
          })),
        };

        // Generate markdown
        const markdown = generateMarkdown({
          frontmatter,
          content: tutorial.content,
        });

        // Validate
        const validation = validateMarkdown(markdown);
        if (!validation.valid) {
          logger.error(`Invalid markdown for ${tutorial.title}:`, validation.errors);
          continue;
        }

        // Save to file
        const filename = generateFilename(new Date(), tutorial.title);
        const filepath = join(contentPath, filename);

        writeFileSync(filepath, markdown, 'utf-8');
        logger.info(`Saved: ${filename}`);

        savedCount++;
      } catch (error: any) {
        logger.error(`Failed to save tutorial ${tutorial.title}:`, error);
      }
    }

    return savedCount;
  }
}

// Export for CLI
export async function runDIYAgent(): Promise<void> {
  const agent = new DIYTutorialsAgent();
  await agent.run();
}
