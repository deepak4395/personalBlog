import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://deepak4395.github.io',
  base: '/personalBlog', // Your repository name - update if different
  integrations: [react(), tailwind()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
