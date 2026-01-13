# Bhagavad Gita Agent

An AI-powered agent that generates blog posts for the Bhagavad Gita, one shloka (verse) at a time.

## Overview

This agent creates daily blog posts covering each verse of the Bhagavad Gita in sequence. Each post includes:

- **Sanskrit text** in Devanagari script
- **Transliteration** in IAST format
- **English translation**
- **Detailed explanation** covering context, word-by-word meaning, deeper understanding, and practical applications
- **Navigation links** to previous and next shlokas
- **Progress tracking** to ensure sequential generation

## Features

### Sequential Generation
- Generates one shloka per workflow run
- Automatically tracks progress through all 700 verses
- Prevents duplicate generation
- Shows "coming soon" for unpublished shlokas

### Progress Tracking
- Stores current position in `.progress.json` file
- Tracks completion percentage
- Automatically stops when all 700 shlokas are complete

### Smart Navigation
- Links to previous and next shlokas
- Shows placeholder for upcoming shlokas
- Groups by chapter for easy browsing
- Displays chapter names and verse numbers

## Structure

```
packages/agent-bhagavad-gita/
├── src/
│   ├── index.ts                    # Main agent implementation
│   ├── types.ts                    # Type definitions and constants
│   ├── generator/
│   │   ├── shloka-generator.ts     # AI-powered shloka blog generator
│   │   └── index.ts
│   └── tracker/
│       ├── progress-tracker.ts     # Sequential progress management
│       └── index.ts
├── package.json
└── tsconfig.json
```

## Configuration

The agent is configured in `config/agents.yaml`:

```yaml
bhagavad-gita:
  enabled: true
  schedule: "0 7 * * *"  # Daily at 7 AM UTC
  outputPath: "bhagavad-gita"
  category: "bhagavad-gita"
  aiModel: "tier1"  # Uses Gemini (good at languages)
```

## Content Schema

Each generated blog post includes:

```typescript
{
  title: string;              // Verse title
  description: string;        // Summary (150-160 chars)
  pubDate: Date;             // Publication date
  chapter: number;           // Chapter number (1-18)
  verse: number;             // Verse number
  chapterName: string;       // Sanskrit chapter name
  sanskrit: string;          // Devanagari text
  transliteration: string;   // IAST romanization
  translation: string;       // English translation
  tags: string[];           // Related tags
  category: "bhagavad-gita";
  aiGenerated: true;
}
```

## Usage

### Run the agent manually:
```bash
pnpm run agent:run bhagavad-gita
```

### Check progress:
The agent automatically logs:
- Current chapter and verse
- Total completion percentage
- Remaining shlokas

### Build the agent:
```bash
cd packages/agent-bhagavad-gita
pnpm build
```

## Progress File

The agent maintains a `.progress.json` file in the content directory:

```json
{
  "currentChapter": 1,
  "currentVerse": 5,
  "totalShlokas": 700,
  "completedShlokas": 4,
  "lastUpdated": "2026-01-13T10:30:00.000Z"
}
```

## Chapter Information

The Bhagavad Gita contains:
- **18 Chapters** (Adhyayas)
- **700 Verses** (Shlokas)
- Varying verse counts per chapter (20-78 verses)

Each chapter has a specific theme:
1. Arjuna Vishada Yoga (47 verses)
2. Sankhya Yoga (72 verses)
3. Karma Yoga (43 verses)
... and so on

## Output

Blog posts are saved to: `website/src/content/bhagavad-gita/`

Filename format: `YYYY-MM-DD-chapter-X-verse-Y.md`

Example: `2026-01-13-chapter-1-verse-1.md`

## Web Pages

### Listing Page
`/bhagavad-gita` - Shows all chapters with verses grouped by chapter

### Individual Shloka Page
`/bhagavad-gita/chapter-X-verse-Y` - Displays full shloka with explanation and navigation

## AI Prompt Structure

The agent uses a comprehensive prompt that requests:
1. Accurate Sanskrit text in Devanagari
2. IAST transliteration
3. Clear English translation
4. Detailed explanation including:
   - Historical and narrative context
   - Word-by-word Sanskrit meanings
   - Philosophical interpretations
   - Practical modern applications
   - Reflection questions

## Completion

When all 700 shlokas are generated:
- The agent will log a completion message
- No more posts will be generated
- The final verse will show "This is the final verse of the Bhagavad Gita"

## Dependencies

- `@personalBlog/core` - Shared utilities and AI client
- `date-fns` - Date formatting

## License

Part of the Personal Blog project.
