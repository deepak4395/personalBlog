# Personal Blog - Complete Documentation

**AI-Powered Multi-Agent Content Platform** | Live at: [blog.sarcasticrobo.online](https://blog.sarcasticrobo.online)

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Quick Start (GitHub-Only Setup)](#2-quick-start-github-only-setup)
3. [Project Structure](#3-project-structure)
4. [Local Development Setup](#4-local-development-setup)
5. [Custom Domain Configuration](#5-custom-domain-configuration)
6. [Manual Content Creation](#6-manual-content-creation)
7. [Adding New AI Agents](#7-adding-new-ai-agents)
8. [GitHub Actions Workflows](#8-github-actions-workflows)
9. [Cost & Resource Estimates](#9-cost--resource-estimates)
10. [Future Enhancements](#10-future-enhancements)
11. [Troubleshooting](#11-troubleshooting)
12. [Security & Best Practices](#12-security--best-practices)

---

## 1. Project Overview

A production-scale blog platform that uses AI agents to automatically generate high-quality content about embedded systems, DevOps, hardware, and microcontrollers. Built with TypeScript monorepo architecture, Astro frontend, and configurable AI model integration.

### 🚀 Key Features

- **Multi-Agent Architecture**: Independent AI agents for different content types
  - **News Aggregator**: Fetches and analyzes latest embedded systems news
  - **DIY Tutorials**: Generates educational content from forum discussions
  - Easily extensible for new agent types

- **GitHub-First Design**: All configuration via GitHub Secrets (no local SOPS needed)

- **Cost-Optimized AI**: Tiered fallback system (Gemini 2.0 Flash paid tier → Groq → OpenAI)

- **Modern Stack**:
  - Astro 4.16+ for zero-JS static site generation
  - TypeScript monorepo with pnpm workspaces
  - Tailwind CSS with custom blog styling
  - Content Collections for type-safe frontmatter

- **Automated Workflows**: GitHub Actions for scheduled content generation and deployment

- **Custom Domain Support**: Environment variable-based configuration for dual domain deployment

### 📊 Project Stats

- **Total Packages**: 4 (core, agent-news, agent-diy-tutorials, scheduler)
- **Dependencies**: 25+ npm packages
- **TypeScript Files**: 30+ source files
- **Lines of Code**: ~3000 LOC
- **Workflow Steps**: 12 automated steps
- **Build Time**: ~60 seconds
- **Deploy Time**: ~2 minutes

---

## 2. Quick Start (GitHub-Only Setup)

**No local installation needed! Everything runs on GitHub.**

### Step 1: Get Your API Keys (5 min)

#### Required (Free):
1. **Gemini API Key**: 
   - Visit: https://aistudio.google.com/apikey
   - Click "Create API Key"
   - Copy the key

2. **Your Email**: For the contact form

#### Optional (Add Later):
- Groq: https://console.groq.com/keys
- OpenAI: https://platform.openai.com/api-keys

### Step 2: Update Configuration Files (2 min)

#### A. Update Website URL

Edit `website/astro.config.mjs`:
```javascript
// Configure site URL from environment variable or use custom domain as default
// Set SITE_DOMAIN to: 'blog.sarcasticrobo.online' (custom) or 'deepak4395.github.io/personalBlog' (GitHub)
const siteDomain = process.env.SITE_DOMAIN || 'blog.sarcasticrobo.online';
const isGitHubPages = siteDomain.includes('github.io');

export default defineConfig({
  site: isGitHubPages 
    ? `https://${siteDomain.split('/')[0]}` 
    : `https://${siteDomain}`,
  base: isGitHubPages && siteDomain.includes('/') 
    ? `/${siteDomain.split('/')[1]}` 
    : '/',
  integrations: [react(), tailwind()],
  // ... rest of config
});
```

**Note:** The config automatically detects GitHub Pages URLs and sets the correct base path.

#### B. Update Contact Email

Edit `website/src/components/FeedbackForm.tsx` (line 17):
```tsx
const response = await fetch('https://formsubmit.co/ajax/YOUR-EMAIL@example.com', {
```

### Step 3: Create GitHub Repository (3 min)

1. Go to GitHub: https://github.com/new
2. Repository name: `personalBlog`
3. Visibility: **Public** (required for free GitHub Pages)
4. Click **Create repository**

### Step 4: Push Code to GitHub (2 min)

In PowerShell (in your project folder):

```powershell
cd d:\CG_DS_ALL\Personal\personalBlog

git init
git add .
git commit -m "Initial blog setup"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/personalBlog.git
git push -u origin main
```

### Step 5: Enable GitHub Pages (1 min)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/docs**
4. Click **Save**

**Note:** The workflow will automatically build your website and commit HTML files to the `docs/` folder. GitHub Pages will serve them from there.

### Step 6: Add GitHub Secrets (3 min)

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

Add these secrets one by one:

| Secret Name | Value | Required |
|-------------|-------|----------|
| `GEMINI_API_KEY` | Your Gemini API key from Step 1 | ✅ Yes |
| `FORMSUBMIT_EMAIL` | Your email address | ✅ Yes |
| `SITE_DOMAIN` | `blog.sarcasticrobo.online` or `username.github.io/personalBlog` | Optional (defaults to custom domain) |

**Optional secrets (add when you want to enable):**
- `GROQ_API_KEY`
- `OPENAI_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `STACKEXCHANGE_API_KEY`

### Step 7: Trigger First Run (1 min)

#### Option 1: Manual Trigger
1. Go to **Actions** tab
2. Click **Generate AI Content** workflow
3. Click **Run workflow** → Select `news` → **Run workflow**

#### Option 2: Wait for Schedule
- News agent runs automatically every day at **6 AM UTC**
- Tutorials run every **Monday at 8 AM UTC**

### Step 8: View Your Blog (1 min)

After workflow completes (~2 minutes):

Visit: `https://YOUR-USERNAME.github.io/personalBlog` or your custom domain

### What Happens Automatically?

```
Every Day at 6 AM UTC:
├─ GitHub Actions wakes up (free server)
├─ Installs all tools (pnpm, Node.js)
├─ Reads your API keys from GitHub Secrets
├─ Runs news agent:
│  ├─ Fetches 281+ tech articles from 7 sources
│  ├─ Ranks by embedded systems relevance
│  ├─ Checks for duplicates (URL + title similarity)
│  ├─ Calls Gemini API to write original analysis
│  └─ Creates .md file: 2026-01-13-new-post.md
├─ Commits the new file to repository
├─ Builds website to static HTML
├─ Commits to docs/ folder
└─ GitHub Pages deploys updated site

Your computer: OFF ✓
Cost: $0 (free tier) ✓
```

---

## 3. Project Structure

```
personalBlog/
├── packages/
│   ├── core/                    # Shared utilities
│   │   ├── src/ai/             # AI client with multi-provider support
│   │   │   ├── client.ts       # AIClient with fallback chain
│   │   │   └── providers/      # Gemini, Groq, OpenAI implementations
│   │   ├── src/config/         # Config loader (GitHub Secrets → YAML)
│   │   └── src/content/        # Markdown generation utilities
│   │
│   ├── agent-news/             # News aggregator agent
│   │   ├── src/sources/        # RSS, Hacker News APIs
│   │   ├── src/processors/     # Deduplication, ranking
│   │   └── src/generator/      # AI blog generation
│   │
│   ├── agent-diy-tutorials/    # Tutorial creator agent
│   │   ├── src/sources/        # Reddit, Stack Exchange APIs
│   │   └── src/generator/      # Multi-phase tutorial generation
│   │
│   └── scheduler/              # CLI orchestrator
│       └── src/cli.ts          # Commands: run-agent, run-all, list
│
├── website/                    # Astro frontend
│   ├── src/content/
│   │   ├── config.ts          # Content collection schemas
│   │   ├── news/              # AI-generated news posts
│   │   └── tutorials/         # AI-generated tutorials
│   ├── src/pages/             # Routes (index, news, tutorials, contact)
│   ├── src/layouts/           # Layout components (BlogPost, Layout)
│   ├── src/components/        # React components (feedback form)
│   └── src/styles/            # Global CSS with custom .blog-content classes
│
├── config/
│   ├── agents.yaml            # Agent configuration (prompts, schedules)
│   └── secrets.yaml           # Runtime secrets (generated from GitHub Secrets)
│
├── templates/                  # Manual blog post templates
│   ├── manual-blog-news.md
│   └── manual-blog-tutorial.md
│
├── docs/                       # Built website (GitHub Pages serves from here)
│   └── .nojekyll              # Prevents Jekyll from ignoring _astro folder
│
├── .github/workflows/
│   └── generate-content.yml   # Single workflow: generate, build, deploy
│
└── DOCUMENTATION.md           # This file (merged all docs)
```

---

## 4. Local Development Setup

### Prerequisites

- **Node.js** 20+
- **pnpm** 8+

### Installation

```powershell
# Install pnpm (if not already installed)
npm install -g pnpm

# Install project dependencies
pnpm install

# Build all TypeScript packages
pnpm -r run build
```

### Running Agents Locally

```powershell
# Create secrets file (GitHub Secrets are only available in Actions)
cat > config/secrets.yaml << 'EOF'
ai:
  google:
    apiKey: "YOUR_GEMINI_API_KEY"
  groq:
    apiKey: "YOUR_GROQ_API_KEY"
  openai:
    apiKey: "YOUR_OPENAI_API_KEY"
social:
  reddit:
    clientId: "YOUR_REDDIT_CLIENT_ID"
    clientSecret: "YOUR_REDDIT_CLIENT_SECRET"
    userAgent: "PersonalBlog/1.0"
  stackexchange:
    apiKey: "YOUR_STACKEXCHANGE_KEY"
email:
  formsubmit:
    email: "your-email@example.com"
EOF

# Run news aggregator
pnpm agents:news

# Run tutorials creator
pnpm agents:tutorials

# List all agents
pnpm agents:list
```

### Development Server

```powershell
cd website
pnpm dev

# Visit http://localhost:4321
```

### Build for Production

```powershell
cd website
pnpm build
pnpm preview
```

---

## 5. Custom Domain Configuration

### Using Custom Domain (e.g., blog.sarcasticrobo.online)

1. **Add CNAME record** in your DNS provider:
   ```
   Type: CNAME
   Name: blog
   Value: YOUR-USERNAME.github.io
   ```

2. **Add custom domain** in GitHub Pages settings:
   - Go to **Settings** → **Pages**
   - Under "Custom domain", enter: `blog.sarcasticrobo.online`
   - Click **Save**
   - GitHub will create a CNAME file in your repository

3. **Update SITE_DOMAIN secret** (optional):
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add secret: `SITE_DOMAIN` = `blog.sarcasticrobo.online`
   - Or leave empty to use default custom domain from astro.config.mjs

### Switching Between Custom Domain and GitHub Pages

The site is configured to support both deployment modes through the `SITE_DOMAIN` environment variable:

**Default** (no secret set): Uses `blog.sarcasticrobo.online` (custom domain, base path `/`)

**To use GitHub Pages URL**: Add GitHub Secret:
- Secret name: `SITE_DOMAIN`
- Value: `deepak4395.github.io/personalBlog`

The config automatically detects GitHub URLs and sets the correct base path.

### How It Works

In `website/astro.config.mjs`:

```javascript
const siteDomain = process.env.SITE_DOMAIN || 'blog.sarcasticrobo.online';
const isGitHubPages = siteDomain.includes('github.io');

export default defineConfig({
  site: isGitHubPages 
    ? `https://${siteDomain.split('/')[0]}` 
    : `https://${siteDomain}`,
  base: isGitHubPages && siteDomain.includes('/') 
    ? `/${siteDomain.split('/')[1]}` 
    : '/',
  // ...
});
```

In `.github/workflows/generate-content.yml`:

```yaml
- name: Build website
  run: |
    pnpm --filter website build
    # ... deployment steps
  env:
    SITE_DOMAIN: ${{ secrets.SITE_DOMAIN || 'blog.sarcasticrobo.online' }}
```

### Domain Failover Strategy

**If custom domain expires:**
1. Update GitHub Secret `SITE_DOMAIN` to `username.github.io/personalBlog`
2. Next workflow run will rebuild with GitHub Pages URL
3. Or manually trigger workflow to rebuild immediately

**No code changes needed!**

---

## 6. Manual Content Creation

### Creating News Posts

1. **Copy template**:
   ```powershell
   cp templates/manual-blog-news.md website/src/content/news/2026-01-13-my-post.md
   ```

2. **Edit frontmatter**:
   ```yaml
   ---
   title: "Your Post Title"
   description: "Brief description for SEO and preview"
   pubDate: 2026-01-13
   tags: ["embedded", "iot", "hardware"]
   category: "news"
   aiGenerated: false
   sources:
     - title: "Source Article"
       site: "Website Name"
       url: "https://example.com/article"
   ---
   ```

3. **Write content** (supports full Markdown + custom CSS)

4. **Commit and push**:
   ```powershell
   git add website/src/content/news/
   git commit -m "Add new blog post"
   git push
   ```

5. **Blog updates automatically** in ~2 minutes

### Creating Tutorial Posts

Same process, but use `templates/manual-blog-tutorial.md` and save to `website/src/content/tutorials/`.

### Content Styling

All blog content uses the `.blog-content` CSS class with enhanced typography:

- **Headings**: `h1` (border-bottom), `h2-h4` (consistent sizing)
- **Lists**: Custom bullets (orange) and numbers
- **Code**: Inline (orange bg) and blocks (dark bg with syntax highlighting)
- **Blockquotes**: Left border with gray background
- **Tables**: Striped rows with hover effects
- **Links**: Primary color with underline on hover

---

## 7. Adding New AI Agents

### 1. Create Agent Package

```powershell
mkdir packages/agent-your-agent
cd packages/agent-your-agent
pnpm init
```

### 2. Implement Agent Interface

```typescript
// packages/agent-your-agent/src/index.ts
import { AIClient } from '@personalBlog/core';
import { saveMarkdownContent } from '@personalBlog/core/content';

export async function runYourAgent(): Promise<void> {
  console.log('Running Your Agent...');
  
  // 1. Fetch data from your sources
  const data = await fetchYourData();
  
  // 2. Process and filter
  const filtered = processData(data);
  
  // 3. Generate content with AI
  const aiClient = new AIClient();
  const content = await aiClient.generateText({
    systemPrompt: 'You are an expert...',
    userPrompt: `Generate content about: ${filtered}`,
    model: 'tier1',
  });
  
  // 4. Save to content collection
  await saveMarkdownContent({
    title: 'Generated Title',
    description: 'Description',
    content,
    category: 'your-category',
    tags: ['tag1', 'tag2'],
  });
  
  console.log('Agent completed successfully!');
}
```

### 3. Register in Scheduler

Edit `packages/scheduler/src/registry.ts`:

```typescript
import { runYourAgent } from '@personalBlog/agent-your-agent';

export const agentRegistry: Record<string, AgentRunner> = {
  'news-aggregator': runNewsAggregator,
  'diy-tutorials': runDIYTutorials,
  'your-agent': runYourAgent, // Add this line
};
```

### 4. Add Configuration

Edit `config/agents.yaml`:

```yaml
agents:
  your-agent:
    enabled: true
    schedule: "0 10 * * *"  # Daily at 10 AM UTC
    outputPath: "your-category"
    category: "your-category"
    maxArticlesPerRun: 3
    model: tier1
    systemPrompt: |
      You are an expert in your domain.
      Provide detailed, accurate content.
    userPromptTemplate: |
      Generate content about: {{topic}}
      Focus on: {{focus}}
```

### 5. Update Content Collections

Edit `website/src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

const yourCategoryCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()),
    category: z.literal('your-category'),
    aiGenerated: z.boolean().default(true),
    sources: z.array(z.object({
      title: z.string(),
      site: z.string(),
      url: z.string(),
    })).optional(),
  }),
});

export const collections = {
  news: newsCollection,
  tutorials: tutorialsCollection,
  'your-category': yourCategoryCollection, // Add this
};
```

### 6. Add Workflow Schedule

Edit `.github/workflows/generate-content.yml`:

```yaml
schedule:
  - cron: '0 6 * * *'     # News daily
  - cron: '0 8 * * 1'     # Tutorials Monday
  - cron: '0 10 * * *'    # Your agent daily at 10 AM
```

---

## 8. GitHub Actions Workflows

### Single Workflow Architecture

The project uses **one workflow** (`.github/workflows/generate-content.yml`) that handles:
1. Content generation (AI agents)
2. Website building (Astro)
3. Deployment (commit to docs/)

### Workflow Triggers

```yaml
on:
  push:
    branches: [main]            # On every push (remove after stable)
  workflow_dispatch:            # Manual trigger
    inputs:
      agent:
        description: 'Which agent to run'
        type: choice
        options: [all, news, tutorials]
  schedule:
    - cron: '0 6 * * *'        # News daily at 6 AM UTC
    - cron: '0 8 * * 1'        # Tutorials Monday 8 AM UTC
```

### Workflow Steps

1. **Checkout repository**
2. **Setup Node.js 20**
3. **Install pnpm**
4. **Cache pnpm store** (speeds up builds)
5. **Install dependencies**
6. **Build TypeScript packages**
7. **Create secrets.yaml** from GitHub Secrets
8. **Run AI agents** (from workspace root using `node packages/scheduler/dist/cli.js`)
9. **Check for new content** (git diff)
10. **Build website** (with SITE_DOMAIN env var)
11. **Copy to docs/** and create `.nojekyll`
12. **Commit and push** (.md files + HTML)

### Working Directory Fix

**Critical:** Agents must run from workspace root, not `packages/scheduler/`:

```yaml
- name: Run agent
  run: |
    if [ "${{ steps.determine-agent.outputs.agent }}" = "all" ]; then
      node packages/scheduler/dist/cli.js run-all
    elif [ "${{ steps.determine-agent.outputs.agent }}" = "news" ]; then
      node packages/scheduler/dist/cli.js run-agent news-aggregator
    else
      node packages/scheduler/dist/cli.js run-agent diy-tutorials
    fi
```

**Why:** File paths are relative to `process.cwd()`, so running from wrong directory saves files to wrong location.

### Required GitHub Secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `GEMINI_API_KEY` | ✅ Yes | AI content generation |
| `FORMSUBMIT_EMAIL` | ✅ Yes | Contact form destination |
| `SITE_DOMAIN` | Optional | Domain switching (defaults to custom domain) |
| `GROQ_API_KEY` | Optional | Fallback AI provider |
| `OPENAI_API_KEY` | Optional | Emergency fallback |

### Manual Workflow Trigger

1. Go to **Actions** tab
2. Select "Generate AI Content"
3. Click **Run workflow**
4. Choose agent: `all`, `news`, or `tutorials`
5. Click **Run workflow**

---

## 9. Cost & Resource Estimates

### AI API Costs (30 posts/month)

- **Gemini 2.0 Flash** (paid tier):
  - Quota: 2K RPM, 4M TPM, unlimited RPD
  - Cost: ~$0.10 per 1M tokens
  - Usage: ~1M tokens/month = **$0.10/month**
  
- **Groq Llama 3.3 70B** (fallback):
  - Free tier: 30 RPM, 6K RPD
  - Used only if Gemini fails
  - Cost: **$0/month**

- **OpenAI GPT-4o-mini** (emergency):
  - Rarely used
  - Cost: ~$0.15 per 1M tokens
  - Estimated: **$0.05/month**

**Total AI Cost: $0.10-0.15/month**

### GitHub Services (Free Tier)

- **GitHub Actions**: 2000 minutes/month
  - Estimated usage: 40-100 minutes/month
  - Cost: **$0**

- **GitHub Pages**: 
  - Unlimited bandwidth
  - 500 builds/month
  - Cost: **$0**

- **GitHub Storage**: 
  - 1 GB free (website uses ~50 MB)
  - Cost: **$0**

### Custom Domain

- **Domain registration**: ~$12/year (optional)
- **DNS hosting**: Free (Cloudflare, etc.)

### Total Monthly Cost

**Without custom domain**: $0.10-0.15/month  
**With custom domain**: $0.10-0.15/month + $1/month (domain)

**Total: ~$1.15/month** (less than a coffee!)

---

## 10. Future Enhancements

### Comments System (Giscus)

**Status**: Planned  
**Cost**: Free  
**Effort**: 30 minutes

**Implementation**:
1. Enable GitHub Discussions in repository settings
2. Install Giscus: https://giscus.app/
3. Create `website/src/components/Comments.tsx`:
   ```tsx
   import { useEffect } from 'react';

   export default function Comments() {
     useEffect(() => {
       const script = document.createElement('script');
       script.src = 'https://giscus.app/client.js';
       script.setAttribute('data-repo', 'username/repo');
       script.setAttribute('data-repo-id', 'YOUR_REPO_ID');
       script.setAttribute('data-category', 'Comments');
       script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID');
       script.setAttribute('data-mapping', 'pathname');
       script.setAttribute('data-reactions-enabled', '1');
       script.setAttribute('data-theme', 'preferred_color_scheme');
       script.crossOrigin = 'anonymous';
       script.async = true;
       
       document.getElementById('comments').appendChild(script);
     }, []);

     return <div id="comments" className="mt-8"></div>;
   }
   ```
4. Add to `BlogPost.astro`: `<Comments client:load />`

**Pros**: Free, GitHub auth, Markdown support, reactions  
**Cons**: Requires GitHub account

---

### Analytics & Like Button (Cloudflare Workers)

**Status**: Planned  
**Cost**: Free (100K requests/day)  
**Effort**: 1 hour

**Implementation**:
1. Create Cloudflare Worker with KV storage
2. API endpoints: `/api/like`, `/api/likes`
3. React component for like button with localStorage

---

### Search (Pagefind)

**Status**: Planned  
**Cost**: Free  
**Effort**: 20 minutes

**Implementation**:
```bash
npx pagefind --source dist
```

Add to `website/src/components/Search.tsx` - no backend needed!

---

### RSS Feed

**Status**: Easy to add  
**Cost**: Free  
**Effort**: 15 minutes

Create `website/src/pages/rss.xml.ts`:
```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const news = await getCollection('news');
  const tutorials = await getCollection('tutorials');
  
  return rss({
    title: 'Embedded Systems Blog',
    description: 'AI-powered content',
    site: context.site,
    items: [...news, ...tutorials].map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/news/${post.slug}/`,
    })),
  });
}
```

---

### Multi-Language Support

**Status**: Future  
**Cost**: Translation API (~$5/month for 100 posts)  
**Effort**: 2-3 hours

Use Astro's i18n + DeepL API for automatic translation.

---

### Newsletter Integration

**Options**:
- ConvertKit (free for <1000 subscribers)
- Mailchimp (free for 500 subscribers)
- Self-hosted Listmonk

**Effort**: 1-2 hours

---

### More AI Agents

**Ideas**:
1. **Hardware Reviews Agent**: Aggregate product launches and reviews
2. **Conference Summaries**: Monitor talks and extract takeaways
3. **Security Alerts**: CVE aggregation and best practices
4. **Open Source Projects**: GitHub trending repos and releases

---

## 11. Troubleshooting

### Workflow Failed

**Symptoms**: Red X in Actions tab

**Solutions**:
1. Click failed workflow → View logs
2. Common issues:
   - **Invalid API key**: Update GitHub Secret
   - **Rate limit**: Increase delay in `blog-generator.ts`
   - **JSON parse error**: Check AI response format
   - **Wrong working directory**: Ensure running from workspace root

### Blog Not Updating

**Symptoms**: New post not appearing on site

**Solutions**:
1. Check Actions tab - workflow should be green ✓
2. Wait 2-3 minutes for GitHub Pages rebuild
3. Hard refresh: `Ctrl+Shift+R`
4. Check `docs/` folder exists with HTML files
5. Verify `.nojekyll` file exists in `docs/`

### CSS Not Loading

**Symptoms**: Plain text, no colors

**Solutions**:
1. Create `.nojekyll` file in `docs/` folder
2. Check `_astro/` folder exists in `docs/`
3. Clear browser cache

### Navigation 404s

**Symptoms**: Links broken, "404 Not Found"

**Solutions**:
1. Check `base` path in `astro.config.mjs`
2. Ensure links use `${base}/path` format
3. For custom domain, `base` should be `/`
4. For GitHub Pages, `base` should be `/personalBlog`

### Duplicate Posts

**Symptoms**: Same article posted multiple times

**Solutions**:
1. Check `filterExistingPosts()` in `packages/agent-news/src/index.ts`
2. Verify source URLs in frontmatter are consistent
3. Check title similarity threshold (currently 60%)

### AI Content Quality Issues

**Symptoms**: Copy-paste text, no analysis

**Solutions**:
1. Update prompts in `config/agents.yaml`
2. Emphasize "ANALYZE and INTERPRET, not copy"
3. Require specific sections (Overview, Technical Implications, Key Takeaways)
4. Increase AI model tier (use GPT-4 instead of Gemini)

---

## 12. Security & Best Practices

### Secrets Management

- ✅ **GitHub Secrets**: Encrypted at rest, only available during workflow runs
- ✅ **Runtime secrets.yaml**: Created during workflow, never committed
- ✅ **.gitignore**: Prevents accidental commits of `config/secrets.yaml`
- ❌ **Never commit API keys** directly to repository

### API Key Rotation

**Best practice**: Rotate keys every 90 days

1. Generate new API key from provider
2. Update GitHub Secret
3. Delete old key from provider
4. Trigger workflow to test

### GitHub Actions Security

- ✅ **Permissions**: Minimal required (`contents: write`)
- ✅ **Token**: Uses `GITHUB_TOKEN` (scoped to repository)
- ✅ **Branch protection**: Only allow pushes from workflow
- ❌ **Never use personal access tokens** unless necessary

### Content Validation

- ✅ **Frontmatter schema**: Validated by Zod in `content/config.ts`
- ✅ **AI response parsing**: Error handling with detailed logs
- ✅ **Duplicate detection**: Prevents republishing same content

### Monitoring

**View logs**:
1. Go to **Actions** tab
2. Click workflow run
3. Expand step to see detailed output

**Set up alerts**:
1. GitHub sends email on workflow failures (default)
2. Or use GitHub API webhooks for custom alerts

---

## 🎉 Conclusion

This blog is a **fully automated, cost-free content platform** that demonstrates the power of AI, GitHub Actions, and modern web technologies.

**Key achievements**:
- ✅ Zero manual intervention (runs daily)
- ✅ $0 hosting (GitHub Pages)
- ✅ ~$0.15/month AI costs
- ✅ Original analysis (not copy-paste)
- ✅ Dual domain support (custom + GitHub fallback)
- ✅ Professional styling with custom CSS
- ✅ Duplicate detection
- ✅ Comprehensive documentation

**Next steps**:
1. Monitor AI-generated content quality
2. Add comments system (Giscus)
3. Implement search (Pagefind)
4. Add RSS feed
5. Create more AI agents

---

## 📞 Support & Contact

- **Live Blog**: [blog.sarcasticrobo.online](https://blog.sarcasticrobo.online)
- **Profile**: [profile.sarcasticrobo.online](https://profile.sarcasticrobo.online)
- **Repository**: [github.com/deepak4395/personalBlog](https://github.com/deepak4395/personalBlog)
- **Contact**: Use feedback form on website

---

**Built with ❤️ and AI in 2026**

*This documentation was created by merging README.md, GITHUB_SETUP.md, TODO.md, and workflow documentation.*
