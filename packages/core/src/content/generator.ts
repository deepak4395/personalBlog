import { stringify } from 'yaml';
import { NewsPost, TutorialPost } from '';

/**
 * Markdown file generator with frontmatter
 */

export interface GenerateMarkdownOptions {
  frontmatter: NewsPost | TutorialPost;
  content: string;
}

/**
 * Generate a complete markdown file with YAML frontmatter
 */
export function generateMarkdown({ frontmatter, content }: GenerateMarkdownOptions): string {
  // Convert frontmatter to YAML
  const yamlFrontmatter = stringify(frontmatter, {
    lineWidth: 0, // Prevent line wrapping
    sortMapEntries: true,
  });

  // Combine frontmatter and content
  const markdown = `---
${yamlFrontmatter.trim()}
---

${content.trim()}
`;

  return markdown;
}

/**
 * Generate a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100); // Limit length
}

/**
 * Generate a filename for a blog post
 */
export function generateFilename(date: Date, title: string): string {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const slug = generateSlug(title);
  return `${dateStr}-${slug}.md`;
}

/**
 * Validate markdown content
 */
export function validateMarkdown(markdown: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for frontmatter
  if (!markdown.startsWith('---\n')) {
    errors.push('Missing frontmatter opening delimiter');
  }

  const frontmatterEnd = markdown.indexOf('\n---\n', 4);
  if (frontmatterEnd === -1) {
    errors.push('Missing frontmatter closing delimiter');
  }

  // Check for content after frontmatter
  const content = markdown.substring(frontmatterEnd + 5).trim();
  if (content.length < 100) {
    errors.push('Content is too short (minimum 100 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
