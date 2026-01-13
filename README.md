# Personal Blog - AI-Powered Content Platform

An automated blog platform featuring AI-generated content for embedded systems, DIY tutorials, and spiritual wisdom from the Bhagavad Gita.

🌐 **Live Site:** [blog.sarcasticrobo.online](https://blog.sarcasticrobo.online)

## 🎯 Overview

This is a fully automated blog system that uses AI agents to generate high-quality content daily. The platform features three distinct content streams:

1. **📰 Embedded Systems News** - AI-curated tech news and analysis
2. **🛠️ DIY Tutorials** - Step-by-step project guides
3. **🕉️ Bhagavad Gita** - Sacred verses with translations and explanations

## ✨ Features

### Multi-Agent Architecture
- **Independent AI Agents** - Each content type has its own specialized agent
- **Scheduled Automation** - GitHub Actions run agents on cron schedules
- **Progress Tracking** - Persistent state management for sequential content
- **Smart Deduplication** - Prevents duplicate content generation

### Content Generation
- **AI-Powered** - Uses Google Gemini, Groq Llama, and OpenAI models
- **Quality Control** - Validation and error handling
- **Markdown Output** - SEO-friendly static site generation
- **Responsive Design** - Mobile-first UI with dark mode

### Bhagavad Gita Agent (New!)
- **Sequential Generation** - One verse per day (700 total)
- **Sanskrit Support** - Devanagari script + IAST transliteration
- **Rich Explanations** - Context, meanings, and practical applications
- **Smart Navigation** - Previous/Next links with "coming soon" placeholders
- **Progress Tracking** - Automatic completion after all 700 verses

## 🏗️ Architecture

```
personalBlog/
├── packages/
│   ├── core/              # Shared utilities, AI client, config
│   ├── scheduler/         # Agent orchestration and CLI
│   ├── agent-news/        # News aggregation agent
│   ├── agent-diy-tutorials/  # Tutorial generator agent
│   └── agent-bhagavad-gita/  # Bhagavad Gita verse agent
├── website/               # Astro-based static site
│   ├── src/
│   │   ├── pages/         # Routes (news, tutorials, bhagavad-gita)
│   │   ├── content/       # Markdown content storage
│   │   ├── layouts/       # Page templates
│   │   └── components/    # React components (BlogFilter, etc.)
│   └── public/            # Static assets
├── config/
│   ├── agents.yaml        # Agent configurations
│   └── secrets.yaml       # API keys (GitHub Actions only)
└── docs/                  # Built static site (GitHub Pages)
```

## 🤖 AI Agents

### News Aggregator
- **Schedule:** Daily at 6 AM UTC
- **Status:** ⏸️ Paused
- **Sources:** RSS feeds (Hackaday, Embedded.com, CNX Software, etc.) + Hacker News API
- **Model:** Google Gemini 2.0 Flash (tier1)

### DIY Tutorials
- **Schedule:** Mondays at 8 AM UTC  
- **Status:** ⏸️ Paused
- **Sources:** Reddit (r/embedded, r/esp32) + Stack Exchange
- **Model:** Groq Llama 3.3 70B (tier2)

### Bhagavad Gita
- **Schedule:** Daily at 8 AM UTC
- **Status:** ✅ Active
- **Content:** 700 verses across 18 chapters
- **Model:** Google Gemini 2.0 Flash (tier1)
- **Progress:** Tracked in `.progress.json`

## 🚀 Tech Stack

- **Framework:** Astro 4.x (Static Site Generation)
- **UI:** React + TailwindCSS
- **AI Models:** Google Gemini, Groq, OpenAI
- **Build Tool:** pnpm (monorepo workspace)
- **CI/CD:** GitHub Actions
- **Hosting:** GitHub Pages (custom domain)
- **Package Manager:** pnpm 8.x
- **Runtime:** Node.js 20.x

## 📅 Automated Workflow

```mermaid
graph LR
    A[GitHub Cron] --> B[Run Agent]
    B --> C[Fetch/Generate Content]
    C --> D[AI Processing]
    D --> E[Save Markdown]
    E --> F[Build Website]
    F --> G[Deploy to GitHub Pages]
    G --> H[Live Site Updated]
```

### Daily Schedule (UTC)
- **6:00 AM** - News Agent (paused)
- **8:00 AM** - Bhagavad Gita Agent ✅
- **8:00 AM Mondays** - Tutorial Agent (paused)

## 🛠️ Setup & Development

### Prerequisites
- Node.js 20+
- pnpm 8+

### Installation
```bash
# Clone repository
git clone https://github.com/deepak4395/personalBlog.git
cd personalBlog

# Install dependencies
pnpm install

# Build all packages
pnpm -r run build
```

### Running Agents Locally
```bash
# List available agents
pnpm run agent:list

# Run specific agent
pnpm run agent:run bhagavad-gita

# Run all enabled agents
pnpm run agent:all
```

### Development
```bash
# Watch mode for packages
pnpm -r run dev

# Build website
cd website
pnpm run build

# Preview built site
pnpm run preview
```

## 🔧 Configuration

### Agent Configuration (`config/agents.yaml`)
```yaml
agents:
  bhagavad-gita:
    enabled: true
    schedule: "0 8 * * *"
    outputPath: "bhagavad-gita"
    aiModel: "tier1"  # Gemini
    config:
      prompts:
        systemPrompt: "..."
        userPromptTemplate: "..."
```

### Environment Variables (GitHub Secrets)
- `GEMINI_API_KEY` - Google AI API key
- `GROQ_API_KEY` - Groq API key
- `OPENAI_API_KEY` - OpenAI API key
- `SITE_DOMAIN` - Custom domain (default: blog.sarcasticrobo.online)

## 📊 Content Schema

### Bhagavad Gita
```typescript
{
  title: string;
  description: string;
  pubDate: Date;
  chapter: number;        // 1-18
  verse: number;          // 1-78 (varies by chapter)
  chapterName: string;    // Sanskrit chapter name
  sanskrit: string;       // Devanagari text
  transliteration: string; // IAST romanization
  translation: string;    // English translation
  tags: string[];
  category: "bhagavad-gita";
  aiGenerated: true;
}
```

## 🌐 Website Features

- **Responsive Design** - Mobile-first with hamburger menu
- **Dark Mode** - Automatic theme support
- **Blog Filter** - Search and tag-based filtering
- **SEO Optimized** - Meta tags, structured data
- **Fast Loading** - Static site generation
- **Clean URLs** - `/bhagavad-gita/chapter-1-verse-1`

## 📝 Content Categories

### News
- Embedded systems industry news
- Hardware announcements
- RTOS updates and releases
- Technical deep dives

### Tutorials
- DIY embedded projects
- Circuit designs
- Programming guides
- Troubleshooting tips

### Bhagavad Gita
- Chapter-by-chapter progression
- Sanskrit with transliteration
- Detailed explanations
- Practical applications

## 🤝 Contributing

This is a personal blog project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Astro** - Amazing static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **Google Gemini** - AI content generation
- **Bhagavad Gita** - Timeless spiritual wisdom

## 📧 Contact

- **Blog:** [blog.sarcasticrobo.online](https://blog.sarcasticrobo.online)
- **Profile:** [profile.sarcasticrobo.online](https://profile.sarcasticrobo.online)
- **GitHub:** [@deepak4395](https://github.com/deepak4395)

---

**Built with ❤️ and AI** | Last Updated: January 2026
