import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import {
  configLoader,
  AIClient,
  logger,
  generateMarkdown,
  generateFilename,
  validateMarkdown,
} from '@personalBlog/core';
import { ShlokaGenerator } from './generator/index.js';
import { ProgressTracker } from './tracker/index.js';
import { GeneratedShlokaPost, ShlokaReference, CHAPTER_NAMES } from './types.js';

/**
 * Bhagavad Gita Agent
 * Generates one shloka blog post per run
 */

export class BhagavadGitaAgent {
  private shlokaGenerator: ShlokaGenerator;
  private progressTracker: ProgressTracker;
  private aiClient: AIClient;

  constructor() {
    this.aiClient = new AIClient();

    // Load config
    const config = configLoader.loadAgentsConfig();
    const agentConfig = (config.agents as any)['bhagavad-gita'];

    this.shlokaGenerator = new ShlokaGenerator(
      this.aiClient,
      agentConfig.config.prompts.systemPrompt,
      agentConfig.config.prompts.userPromptTemplate
    );

    const contentPath = resolve(process.cwd(), config.globalSettings.contentPath);
    this.progressTracker = new ProgressTracker(contentPath);
  }

  /**
   * Run the Bhagavad Gita agent
   */
  async run(): Promise<void> {
    try {
      logger.info('Starting Bhagavad Gita Agent...');

      const config = configLoader.loadAgentsConfig();
      const agentConfig = (config.agents as any)['bhagavad-gita'];

      if (!agentConfig.enabled) {
        logger.warn('Bhagavad Gita agent is disabled');
        return;
      }

      // Step 1: Get next shloka to generate
      const nextShloka = this.progressTracker.getNextShloka();

      if (!nextShloka) {
        logger.info('✅ All 700 shlokas of Bhagavad Gita have been completed!');
        return;
      }

      // Check if this shloka already exists
      if (this.progressTracker.shlokaExists(nextShloka.chapter, nextShloka.verse)) {
        logger.info(
          `Shloka ${nextShloka.chapter}.${nextShloka.verse} already exists, marking as completed...`
        );
        this.progressTracker.markCompleted(nextShloka.chapter, nextShloka.verse);
        return;
      }

      logger.info(
        `Generating shloka: Chapter ${nextShloka.chapter} (${CHAPTER_NAMES[nextShloka.chapter]}), ` +
        `Verse ${nextShloka.verse}`
      );

      const completion = this.progressTracker.getCompletionPercentage();
      logger.info(`Progress: ${completion.toFixed(1)}% (${this.progressTracker.loadProgress().completedShlokas}/700)`);

      // Step 2: Get previous and next shloka references
      const previousShloka = this.progressTracker.getPreviousShloka(nextShloka);
      const nextShlokaRef = this.progressTracker.getNextShlokaReference(nextShloka);

      // Step 3: Generate blog post
      const tier = agentConfig.aiModel || 'tier1';
      const generatedPost = await this.shlokaGenerator.generatePost(
        nextShloka,
        previousShloka,
        nextShlokaRef,
        tier
      );

      // Step 4: Save blog post
      await this.savePost(generatedPost, agentConfig.outputPath);

      // Step 5: Mark as completed
      this.progressTracker.markCompleted(nextShloka.chapter, nextShloka.verse);

      logger.info(`✅ Bhagavad Gita agent completed: Chapter ${nextShloka.chapter}, Verse ${nextShloka.verse}`);

      // Show usage stats
      const usageStats = this.aiClient.getUsageStats();
      logger.info('AI usage:', usageStats);
    } catch (error: any) {
      logger.error('Bhagavad Gita agent failed:', error);
      throw error;
    }
  }

  /**
   * Save generated shloka post
   */
  private async savePost(post: GeneratedShlokaPost, outputPath: string): Promise<void> {
    const config = configLoader.loadAgentsConfig();
    const contentPath = resolve(process.cwd(), config.globalSettings.contentPath, outputPath);

    // Ensure directory exists
    if (!existsSync(contentPath)) {
      mkdirSync(contentPath, { recursive: true });
    }

    // Generate filename: YYYY-MM-DD-chapter-X-verse-Y.md
    const date = new Date();
    const filename = `chapter-${post.chapter}-verse-${post.verse}.md`;
    const filepath = join(contentPath, filename);

    // Build markdown content with navigation
    let markdownContent = post.content;

    // Add navigation section at the end
    markdownContent += '\n\n---\n\n## Navigation\n\n';

    if (post.previousShloka) {
      const prevSlug = `/bhagavad-gita/chapter-${post.previousShloka.chapter}-verse-${post.previousShloka.verse}`;
      markdownContent += `← [Previous: Chapter ${post.previousShloka.chapter}, Verse ${post.previousShloka.verse}](${prevSlug})\n\n`;
    }

    if (post.nextShloka) {
      const nextSlug = `/bhagavad-gita/chapter-${post.nextShloka.chapter}-verse-${post.nextShloka.verse}`;
      markdownContent += `[Next: Chapter ${post.nextShloka.chapter}, Verse ${post.nextShloka.verse}](${nextSlug}) →\n\n`;
      markdownContent += `*Note: The next shloka will be available soon if not yet published.*\n`;
    } else {
      markdownContent += '*This is the final verse of the Bhagavad Gita.*\n';
    }

    // Build frontmatter
    const frontmatter = {
      title: post.title,
      description: post.description,
      pubDate: date,
      chapter: post.chapter,
      verse: post.verse,
      chapterName: CHAPTER_NAMES[post.chapter],
      sanskrit: post.sanskrit,
      transliteration: post.transliteration || '',
      translation: post.translation,
      tags: post.tags,
      category: post.category,
      aiGenerated: true,
    };

    const markdown = generateMarkdown({ frontmatter: frontmatter as any, content: markdownContent });

    // Validate before saving
    const validation = validateMarkdown(markdown);
    if (!validation.valid) {
      logger.warn('Generated markdown has validation issues:', validation.errors);
    }

    // Save file
    writeFileSync(filepath, markdown, 'utf-8');
    logger.info(`Saved shloka post: ${filename}`);
  }
}

/**
 * Convenience runner function
 */
export async function runBhagavadGitaAgent(): Promise<void> {
  const agent = new BhagavadGitaAgent();
  await agent.run();
}
