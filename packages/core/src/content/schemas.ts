import { z } from 'zod';

/**
 * Blog post frontmatter schemas
 */

export const NewsPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.string(), // ISO date string
  tags: z.array(z.string()),
  category: z.string(),
  aiGenerated: z.boolean().default(true),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      site: z.string(),
    })
  ),
});

export const TutorialPostSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.array(z.string()),
  series: z.string().optional(),
  category: z.string(),
  aiGenerated: z.boolean().default(true),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string().url(),
      site: z.string(),
    })
  ),
});

export type NewsPost = z.infer<typeof NewsPostSchema>;
export type TutorialPost = z.infer<typeof TutorialPostSchema>;
