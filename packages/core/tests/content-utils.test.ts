import { describe, it, expect } from 'vitest';
import {
  generateMarkdown,
  generateSlug,
  generateFilename,
  validateMarkdown,
} from '../src/content/generator.js';

describe('Content Utilities', () => {
  describe('generateMarkdown', () => {
    it('should generate markdown with frontmatter', () => {
      const frontmatter = {
        title: 'Test Post',
        description: 'A test description',
        date: new Date('2024-01-15'),
        category: 'test',
        tags: ['test', 'example'],
      };

      const content = 'This is the test content.';

      const result = generateMarkdown({ frontmatter: frontmatter as any, content });

      expect(result).toContain('---');
      expect(result).toContain('title: Test Post');
      expect(result).toContain('This is the test content.');
    });

    it('should properly format YAML frontmatter', () => {
      const frontmatter = {
        title: 'My Post',
        tags: ['tag1', 'tag2'],
        nested: {
          key: 'value',
        },
      };

      const result = generateMarkdown({ frontmatter: frontmatter as any, content: 'Content' });

      expect(result).toMatch(/^---\n/);
      expect(result).toMatch(/\n---\n/);
      expect(result).toContain('tags:');
    });

    it('should trim content and frontmatter', () => {
      const frontmatter = {
        title: 'Test',
      };

      const content = '\n\n  Some content with whitespace  \n\n';

      const result = generateMarkdown({ frontmatter: frontmatter as any, content });

      expect(result).toContain('Some content with whitespace');
      expect(result).not.toMatch(/\n\n\n/);
    });
  });

  describe('generateSlug', () => {
    it('should convert title to lowercase slug', () => {
      const title = 'My Test Title';
      const slug = generateSlug(title);
      expect(slug).toBe('my-test-title');
    });

    it('should replace spaces with hyphens', () => {
      const title = 'This Has Many Spaces';
      const slug = generateSlug(title);
      expect(slug).toBe('this-has-many-spaces');
    });

    it('should remove special characters', () => {
      const title = 'Test! @#$ Post% ^&*()';
      const slug = generateSlug(title);
      expect(slug).toBe('test-post');
    });

    it('should handle multiple consecutive special characters', () => {
      const title = 'Test!!!Post';
      const slug = generateSlug(title);
      expect(slug).toBe('test-post');
    });

    it('should remove leading and trailing hyphens', () => {
      const title = '!!!Test Post!!!';
      const slug = generateSlug(title);
      expect(slug).toBe('test-post');
    });

    it('should limit slug length to 100 characters', () => {
      const title = 'a'.repeat(200);
      const slug = generateSlug(title);
      expect(slug.length).toBe(100);
    });

    it('should handle numbers in titles', () => {
      const title = 'ESP32 Tutorial Part 1';
      const slug = generateSlug(title);
      expect(slug).toBe('esp32-tutorial-part-1');
    });

    it('should handle empty string', () => {
      const title = '';
      const slug = generateSlug(title);
      expect(slug).toBe('');
    });

    it('should handle unicode characters', () => {
      const title = 'Test ñ ü ö Post';
      const slug = generateSlug(title);
      expect(slug).toBe('test-post');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename in YYYY-MM-DD-slug format', () => {
      const date = new Date('2024-01-15');
      const title = 'My Test Post';
      const filename = generateFilename(date, title);
      expect(filename).toBe('2024-01-15-my-test-post.md');
    });

    it('should use slug generation rules', () => {
      const date = new Date('2024-03-20');
      const title = 'ESP32! Tutorial #1';
      const filename = generateFilename(date, title);
      expect(filename).toBe('2024-03-20-esp32-tutorial-1.md');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2024-01-05');
      const title = 'Test';
      const filename = generateFilename(date, title);
      expect(filename).toBe('2024-01-05-test.md');
    });

    it('should always add .md extension', () => {
      const date = new Date('2024-01-01');
      const title = 'Test Post';
      const filename = generateFilename(date, title);
      expect(filename).toMatch(/\.md$/);
    });

    it('should handle long titles with truncation', () => {
      const date = new Date('2024-01-01');
      const title = 'A'.repeat(200);
      const filename = generateFilename(date, title);
      expect(filename.length).toBeLessThan(120); // Date + slug (max 100) + .md
    });
  });

  describe('validateMarkdown', () => {
    it('should validate correct markdown with frontmatter', () => {
      const markdown = `---
title: Test
---

This is a valid markdown content with more than 100 characters to pass the minimum length requirement. It contains sufficient text.`;

      const result = validateMarkdown(markdown);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing frontmatter opening delimiter', () => {
      const markdown = `title: Test
---

Content here`;

      const result = validateMarkdown(markdown);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing frontmatter opening delimiter');
    });

    it('should detect missing frontmatter closing delimiter', () => {
      const markdown = `---
title: Test

Content here`;

      const result = validateMarkdown(markdown);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing frontmatter closing delimiter');
    });

    it('should detect content that is too short', () => {
      const markdown = `---
title: Test
---

Short`;

      const result = validateMarkdown(markdown);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content is too short (minimum 100 characters)');
    });

    it('should validate markdown with exactly 100 characters of content', () => {
      const content = 'a'.repeat(100);
      const markdown = `---
title: Test
---

${content}`;

      const result = validateMarkdown(markdown);
      expect(result.valid).toBe(true);
    });

    it('should handle empty markdown', () => {
      const markdown = '';

      const result = validateMarkdown(markdown);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return all errors when multiple issues exist', () => {
      const markdown = 'Short content';

      const result = validateMarkdown(markdown);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
