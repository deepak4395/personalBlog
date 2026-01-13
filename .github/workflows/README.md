# GitHub Actions Workflows

## Active Workflow

### `generate-content.yml` - **This is the only workflow you need**

**What it does**:
1. Runs AI agents to generate blog posts
2. Builds the website (converts .md to HTML)
3. Commits built files to `docs/` folder
4. GitHub Pages automatically deploys from `docs/`

**When it runs**:
- **Automatic**: Daily at 6 AM UTC (news), Mondays at 8 AM UTC (tutorials)
- **Manual**: Click "Run workflow" on Actions tab

**How to trigger manually**:
1. Go to: https://github.com/deepak4395/personalBlog/actions
2. Click "Generate AI Content"
3. Click "Run workflow"
4. Select agent: `news`, `tutorials`, or `all`
5. Click "Run workflow"

**What happens after**:
- New blog posts saved to: `website/src/content/news/`
- Built HTML committed to: `docs/`
- Live blog updates at: https://deepak4395.github.io/personalBlog

## No Other Workflows Needed

GitHub Pages deployment is automatic from the `docs/` folder - no separate workflow required!
