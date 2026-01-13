# TODO: Future Features

## 🎯 Planned Features

### Comments System (Using Giscus)

**Implementation Plan:**

1. **Enable GitHub Discussions** in repository settings
2. **Install Giscus**: https://giscus.app/
   - Configure with your repository
   - Choose discussion category (e.g., "Comments")
   - Get the script snippet

3. **Create Giscus Component** (`website/src/components/Comments.tsx`):
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

4. **Add to BlogPost Layout**:
   ```astro
   ---
   import Comments from '../components/Comments';
   ---
   <!-- After blog content -->
   <Comments client:load />
   ```

**Pros:**
- Free, no backend needed
- GitHub-based authentication
- Markdown support
- Reactions (like/upvote)

**Cons:**
- Requires GitHub account to comment
- Not suitable for non-technical audience

---

### Analytics & Like Tracking (Cloudflare Workers)

**Implementation Plan:**

1. **Create Cloudflare Worker**:
   ```javascript
   // workers/analytics.js
   export default {
     async fetch(request, env) {
       const url = new URL(request.url);
       
       if (url.pathname === '/api/like') {
         // Increment like count in KV
         const postId = url.searchParams.get('post');
         const current = await env.LIKES.get(postId) || 0;
         await env.LIKES.put(postId, parseInt(current) + 1);
         return new Response(JSON.stringify({ likes: parseInt(current) + 1 }));
       }
       
       if (url.pathname === '/api/likes') {
         // Get like count
         const postId = url.searchParams.get('post');
         const likes = await env.LIKES.get(postId) || 0;
         return new Response(JSON.stringify({ likes: parseInt(likes) }));
       }
     }
   };
   ```

2. **Deploy Worker**:
   ```bash
   npm install -g wrangler
   wrangler login
   wrangler publish
   ```

3. **Create Like Button Component**:
   ```tsx
   // website/src/components/LikeButton.tsx
   import { useState, useEffect } from 'react';

   export default function LikeButton({ postId }: { postId: string }) {
     const [likes, setLikes] = useState(0);
     const [hasLiked, setHasLiked] = useState(false);

     useEffect(() => {
       fetch(`https://your-worker.workers.dev/api/likes?post=${postId}`)
         .then(r => r.json())
         .then(data => setLikes(data.likes));
       
       setHasLiked(localStorage.getItem(`liked-${postId}`) === 'true');
     }, [postId]);

     const handleLike = async () => {
       if (hasLiked) return;
       
       await fetch(`https://your-worker.workers.dev/api/like?post=${postId}`);
       setLikes(likes + 1);
       setHasLiked(true);
       localStorage.setItem(`liked-${postId}`, 'true');
     };

     return (
       <button
         onClick={handleLike}
         disabled={hasLiked}
         className={`px-4 py-2 rounded ${hasLiked ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'}`}
       >
         ❤️ {likes} {hasLiked ? 'Liked' : 'Like'}
       </button>
     );
   }
   ```

**Cloudflare Free Tier:**
- 100,000 requests/day
- 1GB KV reads/day
- Perfect for blog analytics

---

### Image Optimization (Cloudflare Images)

**Implementation Plan:**

1. **Enable Cloudflare Images** in dashboard

2. **Upload Script**:
   ```javascript
   // scripts/upload-image.js
   const formData = new FormData();
   formData.append('file', imageBlob);
   
   const response = await fetch(
     'https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v1',
     {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${API_TOKEN}` },
       body: formData,
     }
   );
   ```

3. **Use in Blog Posts**:
   ```markdown
   ![Alt text](https://imagedelivery.net/ACCOUNT_HASH/IMAGE_ID/public)
   ```

4. **Auto-optimize**:
   - Automatic WebP conversion
   - Responsive variants
   - CDN distribution

---

### Multi-Language Support

**Implementation Plan:**

1. **Update Astro Config**:
   ```javascript
   export default defineConfig({
     i18n: {
       defaultLocale: 'en',
       locales: ['en', 'es', 'fr'],
     },
   });
   ```

2. **Content Structure**:
   ```
   src/content/
     news/
       en/
       es/
       fr/
     tutorials/
       en/
       es/
       fr/
   ```

3. **AI Translation Agent**:
   - Translate existing posts
   - Use GPT-4o or DeepL API
   - Maintain formatting

---

### Newsletter Integration

**Options:**

1. **ConvertKit** (free for <1000 subscribers)
2. **Mailchimp** (free for 500 subscribers)
3. **Self-hosted** (Listmonk + SMTP)

**Implementation:**
- Add email signup form
- Webhook on new posts
- Auto-send digest (weekly/monthly)

---

### Search Functionality

**Options:**

1. **Pagefind** (Static search index):
   ```bash
   npx pagefind --source dist
   ```

2. **Algolia** (Generous free tier)

3. **Meilisearch** (Self-hosted)

**Recommendation:** Pagefind (no backend, works with static sites)

---

### RSS Feed

**Already supported by Astro!**

Add to `astro.config.mjs`:

```javascript
import rss from '@astrojs/rss';

export default defineConfig({
  integrations: [
    // ... other integrations
  ],
  // RSS automatically generated at /rss.xml
});
```

Create `src/pages/rss.xml.ts`:

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

## 🔧 Maintenance Tasks

- [ ] Weekly: Review AI-generated content quality
- [ ] Monthly: Check API usage and costs
- [ ] Quarterly: Update dependencies
- [ ] Yearly: Review and optimize AI prompts

---

## 📝 Content Ideas

### New Agents

1. **Hardware Reviews Agent**
   - Aggregate product launches
   - Summarize reviews
   - Compare specifications

2. **Conference Summaries Agent**
   - Monitor embedded conferences
   - Summarize talks (from YouTube)
   - Extract key takeaways

3. **Security Alerts Agent**
   - CVE aggregation
   - Security advisories
   - Best practices updates

4. **Open Source Projects Agent**
   - GitHub trending repos
   - New releases
   - Community spotlights

---

## 💡 Optimization Ideas

- Implement caching for AI responses
- Use Batch API for OpenAI (50% cost savings)
- Add sitemap generation
- Implement structured data (JSON-LD)
- Add Open Graph meta tags
- Progressive image loading
