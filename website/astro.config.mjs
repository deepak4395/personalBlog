import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// Configure site URL from environment variable or use custom domain as default
// Set SITE_DOMAIN to: 'blog.sarcasticrobo.online' (custom) or 'deepak4395.github.io/personalBlog' (GitHub)
const siteDomain = process.env.SITE_DOMAIN || 'blog.sarcasticrobo.online';
const isGitHubPages = siteDomain.includes('github.io');

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages 
    ? `https://${siteDomain.split('/')[0]}` 
    : `https://${siteDomain}`,
  base: isGitHubPages && siteDomain.includes('/') 
    ? `/${siteDomain.split('/')[1]}` 
    : '/',
  integrations: [react(), tailwind()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
