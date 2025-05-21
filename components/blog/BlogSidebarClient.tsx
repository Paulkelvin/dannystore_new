"use client";
import { useState } from 'react';
import Link from 'next/link';

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  excerpt: string;
  author: {
    name: string;
    image?: any;
  };
  blogCategories: {
    title: string;
    slug: { current: string };
  }[];
}

interface BlogCategory {
  title: string;
  slug: { current: string };
}

export default function BlogSidebarClient({ categories, recentPosts, allPosts }: { categories: BlogCategory[]; recentPosts: BlogPost[]; allPosts: BlogPost[] }) {
  const [search, setSearch] = useState('');
  const filteredPosts = search.length < 2
    ? allPosts
    : allPosts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase())
      );
  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Search blog..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#42A5F5]"
        />
        {search.length >= 2 && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
            {filteredPosts.length > 0 ? (
              filteredPosts.slice(0, 6).map(post => (
                <Link key={post._id} href={`/blog/${post.slug.current}`} className="block text-sm text-[#42A5F5] hover:underline">
                  {post.title}
                </Link>
              ))
            ) : (
              <div className="text-sm text-gray-500">No results found.</div>
            )}
          </div>
        )}
      </div>
      {/* Categories */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Categories</h3>
        <div className="flex flex-col gap-2">
          {categories.map(cat => (
            <Link key={cat.slug.current} href={`/blog/category/${cat.slug.current}`} className="text-[#42A5F5] hover:underline text-sm">
              {cat.title}
            </Link>
          ))}
        </div>
      </div>
      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold mb-2">Recent Posts</h3>
        <ul className="space-y-2">
          {recentPosts.map(post => (
            <li key={post._id}>
              <Link href={`/blog/${post.slug.current}`} className="text-sm hover:underline">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 