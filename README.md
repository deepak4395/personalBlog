# Personal Blog - AI-Powered Multi-Agent Content Platform

A production-scale blog platform that uses AI agents to automatically generate high-quality content about embedded systems, DevOps, hardware, and microcontrollers. Built with TypeScript monorepo architecture, Astro frontend, and configurable AI model integration.

## 🚀 Features

- **Multi-Agent Architecture**: Independent AI agents for different content types
  - **News Aggregator**: Fetches and summarizes latest embedded systems news
  - **DIY Tutorials**: Generates educational content from forum discussions
  - Easily extensible for new agent types

- **Zero Environment Variables**: All configuration (including secrets) managed through SOPS-encrypted YAML files

- **Cost-Optimized AI**: Tiered fallback system (Gemini free tier → Groq → OpenAI) keeps costs under $5/month

- **Modern Stack**:
  - Astro 4+ for zero-JS static site generation
  - TypeScript monorepo with pnpm workspaces
  - Tailwind CSS for styling
  - Content Collections for type-safe frontmatter

- **Automated Workflows**: GitHub Actions for scheduled content generation and deployment

- **Email Feedback**: FormSubmit.co integration (no backend required)

## 📁 Project Structure

```
personalBlog/
├── packages/
│   ├── core/                    # Shared utilities
│   │   ├── src/ai/             # AI client with multi-provider support
│   │   ├── src/config/         # SOPS-based config loader
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
│   │   ├── news/              # AI-generated news posts
│   │   └── tutorials/         # AI-generated tutorials
│   ├── src/pages/             # Routes
│   └── src/components/        # React components (feedback form)
│
├── config/
│   ├── agents.yaml            # Agent configuration
│   └── secrets.enc.yaml       # SOPS-encrypted API keys
│
├── templates/                  # Manual blog post templates
│   ├── manual-blog-news.md
│   └── manual-blog-tutorial.md
│
└── .github/workflows/
    ├── generate-content.yml    # AI content generation
    └── deploy-website.yml      # GitHub Pages deployment
```

## 🔧 Setup

### Prerequisites

- **Node.js** 20+
- **pnpm** 8+
- **SOPS** for secrets management
- **age** for encryption keys

### 1. Install Dependencies

```powershell
# Install pnpm (if not already installed)
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 2. Configure Secrets

#### Generate age encryption key

```powershell
# Install age (Windows - use Scoop or download from GitHub)
# https://github.com/FiloSottile/age/releases

# Generate key
age-keygen -o $env:USERPROFILE\.config\sops\age\keys.txt

# View public key (you'll need this)
Get-Content $env:USERPROFILE\.config\sops\age\keys.txt
```

#### Update `.sops.yaml` with your public key

Edit [.sops.yaml](.sops.yaml) and replace the placeholder with your age public key.

#### Add your API keys to secrets

```powershell
# Edit secrets file (SOPS will encrypt automatically)
sops config/secrets.enc.yaml
```

Add your API keys:

```yaml
ai:
  google:
    apiKey: "YOUR_GEMINI_API_KEY"  # Get from https://aistudio.google.com/apikey
  groq:
    apiKey: "YOUR_GROQ_API_KEY"    # Get from https://console.groq.com/keys
  openai:
    apiKey: "YOUR_OPENAI_API_KEY"  # Get from https://platform.openai.com/api-keys

social:
  reddit:
    clientId: "YOUR_REDDIT_CLIENT_ID"
    clientSecret: "YOUR_REDDIT_CLIENT_SECRET"
    userAgent: "PersonalBlog/1.0"
  
  stackexchange:
    apiKey: "YOUR_STACKEXCHANGE_KEY"  # Optional, increases rate limits

email:
  formsubmit:
    email: "your-email@example.com"  # Where feedback emails go
```

Save and exit - SOPS encrypts automatically.

### 3. Build Packages

```powershell
pnpm -r run build
```

### 4. Run Locally

#### Test individual agents

```powershell
# Run news aggregator
pnpm agents:news

# Run tutorials creator
pnpm agents:tutorials

# List all agents
pnpm agents:list
```

#### Start development server

```powershell
cd website
pnpm dev
```

Visit `http://localhost:4321`

## 📝 Manual Blog Creation

To add a blog post manually:

1. Copy the appropriate template:
   - [templates/manual-blog-news.md](templates/manual-blog-news.md) for news
   - [templates/manual-blog-tutorial.md](templates/manual-blog-tutorial.md) for tutorials

2. Fill in frontmatter and content

3. Save to:
   - `website/src/content/news/YYYY-MM-DD-your-title.md` (news)
   - `website/src/content/tutorials/YYYY-MM-DD-your-title.md` (tutorials)

4. Build and preview:
   ```powershell
   cd website
   pnpm build
   pnpm preview
   ```

## 🤖 Adding New Agents

### 1. Create agent package

```powershell
mkdir packages/agent-your-agent
cd packages/agent-your-agent
pnpm init
```

### 2. Implement agent interface

```typescript
// packages/agent-your-agent/src/index.ts
export async function runYourAgent(): Promise<void> {
  // Your agent logic
}
```

### 3. Register in scheduler

Edit `packages/scheduler/src/registry.ts`:

```typescript
import { runYourAgent } from '@personalBlog/agent-your-agent';

export const agentRegistry: Record<string, AgentRunner> = {
  // ... existing agents
  'your-agent': runYourAgent,
};
```

### 4. Add configuration

Edit `config/agents.yaml`:

```yaml
agents:
  your-agent:
    enabled: true
    schedule: "0 10 * * *"  # Daily at 10 AM
    outputPath: "your-category"
    category: "your-category"
    config:
      # Agent-specific config
```

### 5. Update Content Collections

Edit `website/src/content/config.ts` to add your content schema.

## 🚀 GitHub Actions Setup

### Required Secrets

In your GitHub repository settings, add:

1. **SOPS_AGE_KEY**: Your age private key (content of `keys.txt`)

### Workflows

- **Generate Content** (`.github/workflows/generate-content.yml`):
  - Runs daily at 6 AM UTC (news)
  - Runs Mondays at 8 AM UTC (tutorials)
  - Manual trigger available

- **Deploy Website** (`.github/workflows/deploy-website.yml`):
  - Triggered on push to `main` (website changes)
  - Triggered after content generation
  - Manual trigger available

## 💰 Cost Estimates

### AI API Costs (200-400 posts/month)

- **Gemini 2.5 Flash** (free tier): $0/month
- **Groq Llama 3.3 70B** (fallback): ~$2/month
- **OpenAI GPT-4o-mini** (emergency): ~$3/month
- **Total**: $0-5/month

### GitHub Actions

- Free tier: 2000 minutes/month
- Estimated usage: 40-100 minutes/month (well within limits)

### GitHub Pages Deployment

1. **Enable GitHub Pages**:
   - Repository Settings > Pages
   - Source: "GitHub Actions"

2. **Update site URL** in `website/astro.config.mjs`:
   ```javascript
   site: 'https://yourusername.github.io',
   base: '/personalBlog',
   ```

3. **Push to GitHub** - deployment happens automatically
4. **Visit**: `https://yourusername.github.io/personalBlog`

- Free tier: Unlimited bandwidth
- 500 builds/month (way more than needed)

**Total Monthly Cost: $0-5**

## 🔐 Security Notes

- API keys are encrypted with SOPS (age encryption)
- Never commit unencrypted secrets
- `.gitignore` prevents accidental commits
- GitHub Secrets store only the age private key

## 📊 Monitoring

View agent execution logs in GitHub Actions:

1. Go to "Actions" tab in your repository
2. Select "Generate AI Content" workflow
3. View detailed logs for each run

## 🛠️ Development

### TypeScript Compilation

```powershell
# Watch mode for development
pnpm -r run dev

# Build all packages
pnpm -r run build
```

### Linting

```powershell
pnpm run lint
```

### Type Checking

```powershell
pnpm run type-check
```

## 📚 Tech Stack

- **Frontend**: Astro 4, React, Tailwind CSS
- **AI**: Gemini, Groq, OpenAI (via official SDKs)
- **Content**: RSS feeds, Hacker News API, Reddit API, Stack Exchange API
- **Secrets**: SOPS with age encryption
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 🤝 Contributing

This is a personal project, but feel free to fork and adapt for your own use!

## 📄 License

MIT License - see LICENSE file

## 🔗 Links

- **Profile**: [profile.sarcasticrobo.online](https://profile.sarcasticrobo.online)
- **Blog**: [yourusername.github.io](https://yourusername.github.io) (update after deployment)

## 📞 Support

For questions or feedback, use the contact form on the website or create an issue.

---

Built with ❤️ and AI
