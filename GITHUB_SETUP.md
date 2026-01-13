# GitHub-Only Setup Guide

No local installation needed! Everything runs on GitHub.

## Step 1: Get Your API Keys (5 min)

### Required (Free):
1. **Gemini API Key**: 
   - Visit: https://aistudio.google.com/apikey
   - Click "Create API Key"
   - Copy the key

2. **Your Email**: For the contact form

### Optional (Add Later):
- Groq: https://console.groq.com/keys
- OpenAI: https://platform.openai.com/api-keys

## Step 2: Update Configuration Files (2 min)

### A. Update Website URL

Edit `website/astro.config.mjs`:
```javascript
site: 'https://YOUR-GITHUB-USERNAME.github.io',
base: '/personalBlog',
```

### B. Update Contact Email

Edit `website/src/components/FeedbackForm.tsx` (line 17):
```tsx
const response = await fetch('https://formsubmit.co/ajax/YOUR-EMAIL@example.com', {
```

## Step 3: Create GitHub Repository (3 min)

1. Go to GitHub: https://github.com/new
2. Repository name: `personalBlog`
3. Visibility: **Public** (required for free GitHub Pages)
4. Click **Create repository**

## Step 4: Push Code to GitHub (2 min)

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

## Step 5: Enable GitHub Pages (1 min)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. Click **Save**

## Step 6: Add GitHub Secrets (3 min)

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

Add these secrets one by one:

| Secret Name | Value |
|-------------|-------|
| `GEMINI_API_KEY` | Your Gemini API key from Step 1 |
| `FORMSUBMIT_EMAIL` | Your email address |

**Optional (add when you want to enable):**
- `GROQ_API_KEY`
- `OPENAI_API_KEY`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `STACKEXCHANGE_API_KEY`

## Step 7: Trigger First Run (1 min)

### Option 1: Manual Trigger
1. Go to **Actions** tab
2. Click **Generate AI Content** workflow
3. Click **Run workflow** → Select `news` → **Run workflow**

### Option 2: Wait for Schedule
- News agent runs automatically every day at **6 AM UTC** (11:30 AM IST)
- Tutorials run every **Monday at 8 AM UTC**

## Step 8: View Your Blog (1 min)

After workflow completes (~2 minutes):

Visit: `https://YOUR-USERNAME.github.io/personalBlog`

## What Happens Automatically?

```
Every Day at 6 AM UTC:
├─ GitHub Actions wakes up (free server)
├─ Installs all tools (pnpm, Node.js)
├─ Reads your API keys from GitHub Secrets
├─ Runs news agent:
│  ├─ Fetches tech news from 10+ sources
│  ├─ Calls Gemini API to write blog post
│  └─ Creates .md file: 2026-01-13-new-post.md
├─ Commits the new file to repository
├─ Triggers website rebuild
└─ Updates https://YOUR-USERNAME.github.io/personalBlog

Your computer: OFF ✓
Cost: $0 ✓
```

## Testing Locally (Optional)

If you want to preview before deploying, install Node.js locally:

```powershell
# Install Node.js from https://nodejs.org

npm install -g pnpm
cd d:\CG_DS_ALL\Personal\personalBlog
pnpm install
pnpm -r run build
cd website
pnpm dev

# Visit http://localhost:4321
```

## Adding Manual Blog Posts

No AI needed - just create a markdown file:

1. Copy template: `templates/manual-blog-news.md`
2. Edit content
3. Save to: `website/src/content/news/2026-01-13-my-post.md`
4. Commit and push:
   ```powershell
   git add .
   git commit -m "Add new blog post"
   git push
   ```
5. Blog updates automatically in ~2 minutes

## Troubleshooting

### Workflow Failed?

1. Go to **Actions** tab
2. Click failed workflow
3. Check error message
4. Common issues:
   - Invalid API key → Update GitHub Secret
   - Typo in config files → Fix and push again

### Blog Not Updating?

1. Check Actions tab - workflow should be green ✓
2. Wait 2-3 minutes for GitHub Pages to rebuild
3. Hard refresh browser: `Ctrl+Shift+R`

### Need Help?

Check the logs:
- **Actions** tab → Click workflow → View logs

---

🎉 **Done!** Your AI blog is now live and will update automatically every day!

**URL**: `https://YOUR-USERNAME.github.io/personalBlog`
**Cost**: $0
**Maintenance**: None (runs automatically)
