import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { logger } from '@personalBlog/core';
import { ShlokaProgress, CHAPTER_VERSE_COUNTS, TOTAL_SHLOKAS, ShlokaReference } from '../types.js';

/**
 * Progress Tracker for Bhagavad Gita Shlokas
 * Tracks which shloka should be generated next
 */

export class ProgressTracker {
  private progressFile: string;
  private contentPath: string;

  constructor(contentPath: string) {
    this.contentPath = resolve(contentPath, 'bhagavad-gita');
    this.progressFile = resolve(this.contentPath, '.progress.json');
  }

  /**
   * Load current progress
   */
  loadProgress(): ShlokaProgress {
    if (existsSync(this.progressFile)) {
      try {
        const data = JSON.parse(readFileSync(this.progressFile, 'utf-8'));
        return data;
      } catch (error) {
        logger.warn('Failed to load progress file, starting fresh');
      }
    }

    // Default starting point
    return {
      currentChapter: 1,
      currentVerse: 1,
      totalShlokas: TOTAL_SHLOKAS,
      completedShlokas: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Save progress
   */
  saveProgress(progress: ShlokaProgress): void {
    try {
      writeFileSync(this.progressFile, JSON.stringify(progress, null, 2), 'utf-8');
      logger.info(`Progress saved: Chapter ${progress.currentChapter}, Verse ${progress.currentVerse}`);
    } catch (error) {
      logger.error('Failed to save progress:', error);
    }
  }

  /**
   * Get next shloka to generate
   */
  getNextShloka(): ShlokaReference | null {
    const progress = this.loadProgress();

    // Check if all shlokas are completed
    if (progress.completedShlokas >= TOTAL_SHLOKAS) {
      logger.info('All 700 shlokas of Bhagavad Gita have been completed! 🎉');
      return null;
    }

    return {
      chapter: progress.currentChapter,
      verse: progress.currentVerse,
    };
  }

  /**
   * Get previous shloka reference
   */
  getPreviousShloka(current: ShlokaReference): ShlokaReference | null {
    if (current.chapter === 1 && current.verse === 1) {
      return null; // First shloka
    }

    if (current.verse > 1) {
      return {
        chapter: current.chapter,
        verse: current.verse - 1,
      };
    }

    // Go to previous chapter's last verse
    const prevChapter = current.chapter - 1;
    if (prevChapter < 1) {
      return null;
    }

    return {
      chapter: prevChapter,
      verse: CHAPTER_VERSE_COUNTS[prevChapter],
    };
  }

  /**
   * Get next shloka reference
   */
  getNextShlokaReference(current: ShlokaReference): ShlokaReference | null {
    const versesInCurrentChapter = CHAPTER_VERSE_COUNTS[current.chapter];

    if (current.verse < versesInCurrentChapter) {
      return {
        chapter: current.chapter,
        verse: current.verse + 1,
      };
    }

    // Go to next chapter's first verse
    const nextChapter = current.chapter + 1;
    if (nextChapter > 18) {
      return null; // Last shloka of Gita
    }

    return {
      chapter: nextChapter,
      verse: 1,
    };
  }

  /**
   * Check if a shloka file already exists
   */
  shlokaExists(chapter: number, verse: number): boolean {
    if (!existsSync(this.contentPath)) {
      return false;
    }

    const files = readdirSync(this.contentPath);
    const shlokaPattern = new RegExp(`-chapter-${chapter}-verse-${verse}\\.md$`);
    return files.some(file => shlokaPattern.test(file));
  }

  /**
   * Mark shloka as completed and advance
   */
  markCompleted(chapter: number, verse: number): void {
    const progress = this.loadProgress();

    // Verify this is the expected shloka
    if (progress.currentChapter !== chapter || progress.currentVerse !== verse) {
      logger.warn(
        `Shloka mismatch: expected ${progress.currentChapter}.${progress.currentVerse}, ` +
        `got ${chapter}.${verse}`
      );
    }

    progress.completedShlokas++;
    progress.lastUpdated = new Date().toISOString();

    // Advance to next shloka
    const next = this.getNextShlokaReference({ chapter, verse });
    if (next) {
      progress.currentChapter = next.chapter;
      progress.currentVerse = next.verse;
    } else {
      // All shlokas completed
      logger.info('🎉 All 700 shlokas of Bhagavad Gita completed!');
    }

    this.saveProgress(progress);
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    const progress = this.loadProgress();
    return (progress.completedShlokas / TOTAL_SHLOKAS) * 100;
  }
}
