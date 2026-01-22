import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import {
  configLoader,
  AIClient,
  logger,
  generateMarkdown,
  validateMarkdown,
} from '@personalBlog/core';
import { ShlokaGenerator } from './generator/index.js';
import { ProgressTracker } from './tracker/index.js';
import { GeneratedShlokaPost, CHAPTER_NAMES } from './types.js';

/**
 * Bhagavad Gita Agent
 * Generates daily shloka blog posts with AI
 */

export class BhagavadGitaAgent {
  private shlokaGenerator: ShlokaGenerator;
  private progressTracker: ProgressTracker;
  private aiClient: AIClient;

  constructor() {
    this.aiClient = new AIClient();

    // Load config
    const config = configLoader.loadAgentsConfig();
    const agentConfig = config.agents['bhagavad-gita'];

    this.shlokaGenerator = new ShlokaGenerator(
      this.aiClient,
      agentConfig.config.prompts.systemPrompt,
      agentConfig.config.prompts.userPromptTemplate
    );

    const contentPath = resolve(
      process.cwd(),
      config.globalSettings.contentPath
    );
    this.progressTracker = new ProgressTracker(contentPath);
  }

  /**
   * Run the Bhagavad Gita agent
   */
  async run(): Promise<void> {
    try {
      logger.info('Starting Bhagavad Gita Agent...');

      const config = configLoader.loadAgentsConfig();
      const agentConfig = config.agents['bhagavad-gita'];

      if (!agentConfig.enabled) {
        logger.warn('Bhagavad Gita agent is disabled');
        return;
      }

      // Get next shloka to generate
      const nextShloka = this.progressTracker.getNextShloka();
      if (!nextShloka) {
        logger.info('All 700 shlokas of Bhagavad Gita have been completed! 🎉');
        return;
      }

      // Check if already exists
      if (this.progressTracker.shlokaExists(nextShloka.chapter, nextShloka.verse)) {
        logger.info(
          `Shloka ${nextShloka.chapter}.${nextShloka.verse} already exists, marking as completed`
        );
        this.progressTracker.markCompleted(nextShloka.chapter, nextShloka.verse);
        return;
      }

      // Get navigation references
      const previousShloka = this.progressTracker.getPreviousShloka(nextShloka);
      const nextShlokaRef = this.progressTracker.getNextShlokaReference(nextShloka);

      logger.info(
        `Generating shloka: Chapter ${nextShloka.chapter}, Verse ${nextShloka.verse}`
      );

      // Generate blog post
      const tier = agentConfig.aiModel || 'tier1';
      const post = await this.shlokaGenerator.generatePost(
        nextShloka,
        previousShloka,
        nextShlokaRef,
        tier
      );

      // Save blog post
      await this.savePost(post, agentConfig.outputPath);

      // Mark as completed
      this.progressTracker.markCompleted(nextShloka.chapter, nextShloka.verse);

      // Show progress
      const completion = this.progressTracker.getCompletionPercentage();
      logger.info(`✅ Bhagavad Gita agent completed: ${completion.toFixed(1)}% done`);

      // Show usage stats
      const usageStats = this.aiClient.getUsageStats();
      logger.info('AI usage:', usageStats);
    } catch (error: any) {
      logger.error('Bhagavad Gita agent failed:', error);
      throw error;
    }
  }

  /**
   * Save generated shloka post to markdown file
   */
  private async savePost(
    post: GeneratedShlokaPost,
    outputPath: string
  ): Promise<void> {
    const config = configLoader.loadAgentsConfig();
    const contentPath = resolve(
      process.cwd(),
      config.globalSettings.contentPath,
      outputPath
    );

    // Ensure directory exists
    if (!existsSync(contentPath)) {
      mkdirSync(contentPath, { recursive: true });
    }

    // Create frontmatter
    const frontmatter: any = {
      title: post.title,
      description: post.description,
      pubDate: new Date().toISOString(),
      chapter: post.chapter,
      verse: post.verse,
      chapterName: post.chapterName || CHAPTER_NAMES[post.chapter],
      sanskrit: post.sanskrit,
      transliteration: post.transliteration,
      translation: post.translation,
      tags: post.tags,
      category: post.category,
      aiGenerated: true,
      previousShloka: post.previousShloka,
      nextShloka: post.nextShloka,
    };

    // Generate markdown
    const markdown = generateMarkdown({
      frontmatter,
      content: post.content,
    });

    // Validate
    const validation = validateMarkdown(markdown);
    if (!validation.valid) {
      logger.error(`Invalid markdown for ${post.title}:`, validation.errors);
      throw new Error('Generated invalid markdown');
    }

    // Save to file
    const filename = `chapter-${post.chapter}-verse-${post.verse}.md`;
    const filepath = join(contentPath, filename);

    writeFileSync(filepath, markdown, 'utf-8');
    logger.info(`Saved: ${filename}`);
    logger.info(`Full path: ${filepath}`);
  }
}

// Export for CLI
export async function runBhagavadGitaAgent(): Promise<void> {
  const agent = new BhagavadGitaAgent();
  await agent.run();
}