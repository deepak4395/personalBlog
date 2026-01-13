import { z, defineCollection } from 'astro:content';

const newsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
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
  }),
});

const tutorialsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
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
  }),
});

const bhagavadGitaCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    chapter: z.number(),
    verse: z.number(),
    chapterName: z.string(),
    sanskrit: z.string(),
    transliteration: z.string().optional(),
    translation: z.string(),
    tags: z.array(z.string()),
    category: z.string(),
    aiGenerated: z.boolean().default(true),
  }),
});

export const collections = {
  news: newsCollection,
  tutorials: tutorialsCollection,
  'bhagavad-gita': bhagavadGitaCollection,
};
