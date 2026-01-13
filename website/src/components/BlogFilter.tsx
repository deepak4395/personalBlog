import { useState, useEffect } from 'react';

interface BlogPost {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
    category: string;
    difficulty?: string;
  };
}

interface BlogFilterProps {
  posts: BlogPost[];
  base: string;
}

export default function BlogFilter({ posts, base }: BlogFilterProps) {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(posts.flatMap(post => post.data.tags))
  ).sort();

  useEffect(() => {
    let filtered = posts;

    // Filter by selected tag
    if (selectedTag !== 'all') {
      filtered = filtered.filter(post =>
        post.data.tags.some(tag =>
          tag.toLowerCase() === selectedTag.toLowerCase()
        )
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.data.tags.some(tag =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredPosts(filtered);
  }, [selectedTag, searchTerm, posts]);

  return (
    <div className="mb-12">
      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Tag Search */}
          <div>
            <label htmlFor="tag-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Tags
            </label>
            <input
              id="tag-search"
              type="text"
              placeholder="Type to search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Tag Filter Dropdown */}
          <div>
            <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Tag
            </label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Tags ({posts.length} posts)</option>
              {allTags.map(tag => {
                const count = posts.filter(p =>
                  p.data.tags.some(t => t.toLowerCase() === tag.toLowerCase())
                ).length;
                return (
                  <option key={tag} value={tag}>
                    {tag} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredPosts.length} of {posts.length} posts
          </span>
          {(selectedTag !== 'all' || searchTerm) && (
            <>
              <span className="text-gray-400">•</span>
              {selectedTag !== 'all' && (
                <button
                  onClick={() => setSelectedTag('all')}
                  className="text-xs px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition"
                >
                  Tag: {selectedTag} ✕
                </button>
              )}
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition"
                >
                  Search: "{searchTerm}" ✕
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <a href={`${base}/${post.data.category}/${post.slug}`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition">
                  {post.data.title}
                </h3>
              </a>

              {/* Category Badge */}
              <div className="mb-3">
                <span className={`text-xs px-2 py-1 rounded ${
                  post.data.category === 'news'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {post.data.category}
                </span>
                {post.data.difficulty && (
                  <span className={`ml-2 text-xs px-2 py-1 rounded ${
                    post.data.difficulty === 'beginner'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : post.data.difficulty === 'intermediate'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {post.data.difficulty}
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {post.data.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.data.tags.slice(0, 3).map((tag) => (
                  <button
                    key={tag}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedTag(tag);
                      setSearchTerm('');
                    }}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-800 dark:hover:text-primary-200 transition"
                  >
                    {tag}
                  </button>
                ))}
                {post.data.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 text-gray-500">
                    +{post.data.tags.length - 3}
                  </span>
                )}
              </div>

              <time className="text-sm text-gray-500 dark:text-gray-500">
                {new Date(post.data.pubDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </article>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No posts found matching your filters.
            </p>
            <button
              onClick={() => {
                setSelectedTag('all');
                setSearchTerm('');
              }}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
