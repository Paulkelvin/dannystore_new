import { sanityClientPublic } from '@/lib/sanityClient';
import { urlFor } from '@/lib/sanityClient';
import Image from 'next/image';
import Link from 'next/link';
import { PortableTextRenderer } from '@/components/PortableTextRenderer';

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

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#333333] mb-8">Blog</h1>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">No blog posts yet</h2>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                <Link href={`/blog/${post.slug.current}`}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={urlFor(post.mainImage).url()}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex gap-2 mb-3">
                      {post.blogCategories.map((category) => (
                        <span
                          key={category.slug.current}
                          className="text-xs font-medium text-[#42A5F5] bg-[#42A5F5]/10 px-2 py-1 rounded-full"
                        >
                          {category.title}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-bold text-[#333333] mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.author.image && (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={urlFor(post.author.image).url()}
                              alt={post.author.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="text-sm text-gray-600">{post.author.name}</span>
                      </div>
                      <time className="text-sm text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </time>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 