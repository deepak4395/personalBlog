# Quick Start Guide

Get your AI-powered blog running in 15 minutes!

## 1. Get API Keys (5 min)

**Minimum required:**
- **Gemini API Key** (FREE): https://aistudio.google.com/apikey
- **Your Email**: For contact form

**Optional (for more features):**
- Groq API: https://console.groq.com/keys
- OpenAI API: https://platform.openai.com/api-keys  
- Reddit App: https://www.reddit.com/prefs/apps
- Stack Exchange: https://stackapps.com/apps/oauth/register

## 2. Update Website Config (1 min)

Edit `website/astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://yourusername.github.io/personalBlog', // Update this
  // ...
});
```

Edit `website/src/components/FeedbackForm.tsx` - line 17:

```tsx
const response = await fetch('https://formsubmit.co/ajax/YOUR-EMAIL@example.com', {
```

## 3. Deploy to GitHub Pages

### Setup GitHub Repository

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/personalBlog.git
git push -u origin main
```

### Enable GitHub Pages

1. Go to repository `Settings` > `Pages`
2. Under "Build and deployment":
   - Source: **GitHub Actions**

### Add GitHub Secrets

Go to: `Settings` > `Secrets and variables` > `Actions` > `New repository secret`

**Required:**
- `GEMINI_API_KEY` - Your Gemini API key
- `FORMSUBMIT_EMAIL` - Your email address

**Optional (add later for more features):**
- `GROQ_API_KEY`
- `OPENAI_API_KEY`
- `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`
- `STACKEXCHANGE_API_KEY`

### Enable GitHub Actions

1. Go to repository `Settings` > `Actions` > `General`
2. Enable "Allow all actions and reusable workflows"
3. Enable "Read and write permissions" under Workflow permissions

### Trigger First Run

```powershell
# Manual trigger via GitHub Actions tab
# Or wait for scheduled run (daily at 6 AM UTC for news)
```

## Next Steps

### Test Tutorial Generation (Requires Reddit/Stack Exchange keys)

```powershell
pnpm agents:tutorials
```

### Add Manual Blog Post

1. Copy template: `templates/manual-blog-news.md`
2. Edit and save to: `website/src/content/news/2026-01-13-my-post.md`
3. Build and view:
   ```powershell
   cd website
   pnpm build
   pnpm preview
   ```

### Customize Website

- Edit colors in `website/tailwind.config.mjs`
- Modify layouts in `website/src/layouts/`
- Update content in `website/src/pages/`

## Troubleshooting

### "pnpm: command not found"

Install pnpm globally: `npm install -g pnpm`

### "sops: command not found"

Add SOPS to your PATH or use full path to executable.

### "Failed to decrypt secrets"

Check that:
1. Age key is in `~/.config/sops/age/keys.txt`
2. Public key in `.sops.yaml` matches your key
3. File permissions are correct (600 for keys.txt)

### AI generation fails

Check that:
1. API keys are correct in `config/secrets.enc.yaml`
2. You have internet connection
3. API quotas haven't been exceeded

### Website build fails

```powershell
# Clear cache and rebuild
cd website
rm -r node_modules .astro dist
pnpm install
pnpm build
```

## Support

- Check [README.md](README.md) for detailed documentation
- See [TODO.md](TODO.md) for future features
- Create an issue on GitHub for bugs

---

🎉 **You're all set!** Your AI-powered blog is ready to generate content automatically.
