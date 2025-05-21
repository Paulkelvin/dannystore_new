import { sanityClientPublic } from '@/lib/sanityClient';
import { urlFor } from '@/lib/sanityClient';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';

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

async function getBlogPosts() {
  const query = `*[_type == "blogPost"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    excerpt,
    author->{
      name,
      image
    },
    blogCategories[]->{
      title,
      slug
    }
  }`;
  return sanityClientPublic.fetch<BlogPost[]>(query);
}

async function getBlogCategories() {
  const query = `*[_type == "blogCategory"] | order(title asc) {
    title,
    slug
  }`;
  return sanityClientPublic.fetch<BlogCategory[]>(query);
}

const BlogSidebarClient = dynamic(() => import('../../components/blog/BlogSidebarClient'), { ssr: false });

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const categories = await getBlogCategories();
  const recentPosts = posts.slice(0, 5);

  // The search will be handled client-side for instant feedback
  // (If you want server-side, let me know)

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <h1 className="text-4xl font-bold text-[#333333] mb-8">Our Blog</h1>
          <BlogGrid posts={posts} />
        </div>
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 flex-shrink-0">
          <BlogSidebarClient categories={categories} recentPosts={recentPosts} allPosts={posts} />
        </aside>
      </div>
    </main>
  );
}

// BlogGrid component
function BlogGrid({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">No blog posts yet</h2>
        <p className="text-gray-500">Check back soon for new content!</p>
      </div>
    );
  }
  // First post is featured
  const [featured, ...rest] = posts;
  return (
    <>
      {/* Featured Post */}
      <div className="mb-8 flex flex-col md:flex-row gap-0 md:gap-0 rounded-lg shadow-lg overflow-hidden bg-white">
        <div className="relative w-full md:w-1/2 h-64 md:h-72">
          <Image
            src={urlFor(featured.mainImage).url()}
            alt={featured.title}
            fill
            className="object-cover h-full w-full rounded-none md:rounded-l-lg md:rounded-r-none"
          />
        </div>
        <div className="flex-1 flex flex-col justify-center p-6">
          <div className="mb-2">
            {featured.blogCategories.map((cat) => (
              <span
                key={cat.slug.current}
                className="inline-block text-xs font-medium text-[#42A5F5] bg-[#42A5F5]/10 px-2 py-1 rounded-full mr-2 mb-2"
              >
                {cat.title}
              </span>
            ))}
          </div>
          <Link href={`/blog/${featured.slug.current}`} className="block">
            <h2 className="text-2xl font-bold text-[#333333] mb-2 line-clamp-2">{featured.title}</h2>
            <p className="text-gray-600 mb-4 line-clamp-3">{featured.excerpt}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>{new Date(featured.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="mx-2">·</span>
              <span className="text-[#42A5F5]">{featured.author.name}</span>
            </div>
            <span className="text-[#42A5F5] font-medium hover:underline">Read More &rarr;</span>
          </Link>
        </div>
      </div>
      {/* Grid of other posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rest.map((post) => (
          <Link key={post._id} href={`/blog/${post.slug.current}`} className="block bg-white rounded-lg shadow overflow-hidden hover:scale-[1.02] transition-transform">
            <div className="relative h-48 w-full">
              <Image
                src={urlFor(post.mainImage).url()}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-2">
                {post.blogCategories.map((cat) => (
                  <span
                    key={cat.slug.current}
                    className="text-xs font-medium text-[#42A5F5] bg-[#42A5F5]/10 px-2 py-1 rounded-full"
                  >
                    {cat.title}
                  </span>
                ))}
              </div>
              <h3 className="text-lg font-bold text-[#333333] mb-1 line-clamp-2">{post.title}</h3>
              <p className="text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="mx-2">·</span>
                <span className="text-[#42A5F5]">{post.author.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
} 