import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressTracker } from '../src/tracker/progress-tracker.js';
import * as fs from 'fs';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

// Mock logger
vi.mock('@personalBlog/core', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('ProgressTracker', () => {
  let tracker: ProgressTracker;

  beforeEach(() => {
    vi.clearAllMocks();
    tracker = new ProgressTracker('./content');
  });

  describe('Initial State', () => {
    it('should start at Chapter 1, Verse 1 when no progress file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const progress = tracker.loadProgress();

      expect(progress.currentChapter).toBe(1);
      expect(progress.currentVerse).toBe(1);
      expect(progress.completedShlokas).toBe(0);
      expect(progress.totalShlokas).toBe(701);
    });

    it('should return Chapter 1, Verse 1 for initial getNextShloka call', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const nextShloka = tracker.getNextShloka();

      expect(nextShloka).toEqual({ chapter: 1, verse: 1 });
    });
  });

  describe('Loading Existing Progress', () => {
    it('should load progress from file', () => {
      const mockProgress = JSON.stringify({
        currentChapter: 2,
        currentVerse: 10,
        totalShlokas: 701,
        completedShlokas: 57,
        lastUpdated: '2024-01-15T00:00:00.000Z',
      });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockProgress);

      const progress = tracker.loadProgress();

      expect(progress.currentChapter).toBe(2);
      expect(progress.currentVerse).toBe(10);
      expect(progress.completedShlokas).toBe(57);
    });

    it('should handle corrupted progress file gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

      const progress = tracker.loadProgress();

      // Should return default state
      expect(progress.currentChapter).toBe(1);
      expect(progress.currentVerse).toBe(1);
    });
  });

  describe('Saving Progress', () => {
    it('should save progress to file', () => {
      const progress = {
        currentChapter: 3,
        currentVerse: 15,
        totalShlokas: 701,
        completedShlokas: 119,
        lastUpdated: '2024-01-15T00:00:00.000Z',
      };

      tracker.saveProgress(progress);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('.progress.json'),
        expect.stringContaining('"currentChapter": 3'),
        'utf-8'
      );
    });

    it('should handle save errors gracefully', () => {
      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        throw new Error('Write failed');
      });

      const progress = {
        currentChapter: 1,
        currentVerse: 1,
        totalShlokas: 701,
        completedShlokas: 0,
        lastUpdated: '2024-01-15T00:00:00.000Z',
      };

      // Should not throw
      expect(() => tracker.saveProgress(progress)).not.toThrow();
    });
  });

  describe('getNextShloka', () => {
    it('should return current shloka from progress', () => {
      const mockProgress = JSON.stringify({
        currentChapter: 5,
        currentVerse: 20,
        totalShlokas: 701,
        completedShlokas: 200,
        lastUpdated: '2024-01-15T00:00:00.000Z',
      });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockProgress);

      const nextShloka = tracker.getNextShloka();

      expect(nextShloka).toEqual({ chapter: 5, verse: 20 });
    });

    it('should return null when all 701 shlokas are completed', () => {
      const mockProgress = JSON.stringify({
        currentChapter: 18,
        currentVerse: 78,
        totalShlokas: 701,
        completedShlokas: 701,
        lastUpdated: '2024-01-15T00:00:00.000Z',
      });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockProgress);

      const nextShloka = tracker.getNextShloka();

      expect(nextShloka).toBeNull();
    });
  });

  describe('getPreviousShloka', () => {
    it('should return previous verse in same chapter', () => {
      const current = { chapter: 2, verse: 10 };
      const previous = tracker.getPreviousShloka(current);

      expect(previous).toEqual({ chapter: 2, verse: 9 });
    });

    it('should return null for first shloka', () => {
      const current = { chapter: 1, verse: 1 };
      const previous = tracker.getPreviousShloka(current);

      expect(previous).toBeNull();
    });

    it('should return last verse of previous chapter when at first verse', () => {
      const current = { chapter: 2, verse: 1 };
      const previous = tracker.getPreviousShloka(current);

      expect(previous).toEqual({ chapter: 1, verse: 47 });
    });

    it('should handle chapter transitions correctly', () => {
      const current = { chapter: 3, verse: 1 };
      const previous = tracker.getPreviousShloka(current);

      expect(previous).toEqual({ chapter: 2, verse: 72 });
    });
  });

  describe('getNextShlokaReference', () => {
    it('should return next verse in same chapter', () => {
      const current = { chapter: 1, verse: 10 };
      const next = tracker.getNextShlokaReference(current);

      expect(next).toEqual({ chapter: 1, verse: 11 });
    });

    it('should advance to next chapter when at last verse', () => {
      const current = { chapter: 1, verse: 47 };
      const next = tracker.getNextShlokaReference(current);

      expect(next).toEqual({ chapter: 2, verse: 1 });
    });

    it('should return null for last shloka of Gita', () => {
      const current = { chapter: 18, verse: 78 };
      const next = tracker.getNextShlokaReference(current);

      expect(next).toBeNull();
    });

    it('should handle various chapter transitions', () => {
      const testCases = [
        { current: { chapter: 2, verse: 72 }, expected: { chapter: 3, verse: 1 } },
        { current: { chapter: 5, verse: 29 }, expected: { chapter: 6, verse: 1 } },
        { current: { chapter: 12, verse: 20 }, expected: { chapter: 13, verse: 1 } },
      ];

      testCases.forEach(({ current, expected }) => {
        const next = tracker.getNextShlokaReference(current);
        expect(next).toEqual(expected);
      });
    });
  });

  describe('markCompleted', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    });

    it('should advance to next verse in same chapter', () => {
      tracker.markCompleted(1, 1);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"currentChapter": 1'),
        'utf-8'
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"currentVerse": 2'),
        'utf-8'
      );
    });

    it('should advance to next chapter when completing last verse', () => {
      // Start at Chapter 1, Verse 47 (last verse of Chapter 1)
      const mockProgress = JSON.stringify({
        currentChapter: 1,
        currentVerse: 47,
        totalShlokas: 701,
        completedShlokas: 46,
        lastUpdated: '2024-01-15T00:00:00.000Z',
      });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockProgress);

      tracker.markCompleted(1, 47);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"currentChapter": 2'),
        'utf-8'
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"currentVerse": 1'),
        'utf-8'
      );
    });

    it('should increment completedShlokas counter', () => {
      tracker.markCompleted(1, 1);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"completedShlokas": 1'),
        'utf-8'
      );
    });

    it('should update lastUpdated timestamp', () => {
      tracker.markCompleted(1, 1);

      const savedData = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      const parsed = JSON.parse(savedData);

      expect(parsed.lastUpdated).toBeDefined();
      expect(new Date(parsed.lastUpdated)).toBeInstanceOf(Date);
    });

    it('should handle completion of all shlokas', () => {
      // Start at last shloka
      const mockProgress = JSON.stringify({
        currentChapter: 18,
        currentVerse: 78,
        totalShlokas: 701,
        completedShlokas: 700,
        lastUpdated: '2024-01-15T00:00:00.000Z',
      });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockProgress);

      tracker.markCompleted(18, 78);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"completedShlokas": 701'),
        'utf-8'
      );
    });

    it('should warn when marking mismatched shloka', async () => {
      // Import logger module directly to spy on it
      const loggerModule = await import('@personalBlog/core');
      const warnSpy = vi.spyOn(loggerModule.logger, 'warn');

      // Progress is at Chapter 1, Verse 1
      tracker.markCompleted(2, 5); // Try to mark Chapter 2, Verse 5

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Shloka mismatch')
      );
    });
  });

  describe('getCompletionPercentage', () => {
    it('should return 0% for initial state', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const percentage = tracker.getCompletionPercentage();

      expect(percentage).toBe(0);
    });

    it('should calculate percentage correctly', () => {
      const mockProgress = JSON.stringify({
        currentChapter: 10,
        currentVerse: 1,
        totalShlokas: 701,
        completedShlokas: 350,
        lastUpdated: '2024-01-15T00:00:00.000Z',
      });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockProgress);

      const percentage = tracker.getCompletionPercentage();

      expect(percentage).toBeCloseTo(49.93, 1);
    });

    it('should return 100% when all shlokas completed', () => {
      const mockProgress = JSON.stringify({
        currentChapter: 18,
        currentVerse: 78,
        totalShlokas: 701,
        completedShlokas: 701,
        lastUpdated: '2024-01-15T00:00:00.000Z',
      });

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockProgress);

      const percentage = tracker.getCompletionPercentage();

      expect(percentage).toBe(100);
    });
  });

  describe('shlokaExists', () => {
    it('should return false when content directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const exists = tracker.shlokaExists(1, 1);

      expect(exists).toBe(false);
    });

    it('should return true when shloka file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue(['chapter-1-verse-1.md'] as any);

      const exists = tracker.shlokaExists(1, 1);

      expect(exists).toBe(true);
    });

    it('should return false when shloka file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue(['chapter-1-verse-1.md'] as any);

      const exists = tracker.shlokaExists(1, 2);

      expect(exists).toBe(false);
    });

    it('should check correct filename format', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        'chapter-5-verse-20.md',
        'other-file.md',
      ] as any);

      const exists = tracker.shlokaExists(5, 20);

      expect(exists).toBe(true);
    });
  });
});
