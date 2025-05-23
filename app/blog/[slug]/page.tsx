import { sanityClientPublic } from '@/lib/sanityClient';
import { urlFor } from '@/lib/sanityClient';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface SanityImageReference {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: SanityImageReference;
  publishedAt: string;
  body: PortableTextBlock[];
  author: {
    name: string;
    image?: SanityImageReference;
    bio?: string;
  };
  blogCategories: {
    title: string;
    slug: { current: string };
  }[];
  featuredProductsInPost?: {
    _id: string;
    name: string;
    slug: { current: string };
    mainImage: SanityImageReference;
    price: number;
  }[];
}

// Serialize data to ensure it's safe to pass to client components
function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

async function getBlogPost(slug: string) {
  const query = `*[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    mainImage,
    publishedAt,
    body,
    author->{
      name,
      image,
      bio
    },
    blogCategories[]->{
      title,
      slug
    },
    featuredProductsInPost[]->{
      _id,
      name,
      slug,
      mainImage,
      price
    }
  }`;
  const post = await sanityClientPublic.fetch<BlogPost | null>(query, { slug });
  return post ? serializeData(post) : null;
}

// Create a client component wrapper for PortableTextRenderer
const ClientPortableText = dynamic(() => import('@/components/ClientPortableText'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  ),
});

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  if (!post) return { title: 'Blog Post Not Found' };
  
  return {
    title: post.title,
    description: post.body[0]?.children[0]?.text || 'Blog post from DannyStore',
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }

  return (
    <main className="pt-24 pb-16">
      <article className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.blogCategories.map((category) => (
              <Link
                key={category.slug.current}
                href={`/blog/category/${category.slug.current}`}
                className="text-sm font-medium text-[#42A5F5] bg-[#42A5F5]/10 px-3 py-1 rounded-full hover:bg-[#42A5F5]/20 transition-colors"
              >
                {category.title}
              </Link>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#333333] mb-6">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mb-8">
            {post.author.image && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={urlFor(post.author.image)?.url() ?? '/images/placeholder.png'}
                  alt={post.author.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            )}
            <div>
              <p className="font-medium text-[#333333]">{post.author.name}</p>
              <time className="text-sm text-gray-500">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </div>
          <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
            <Image
              src={urlFor(post.mainImage)?.url() ?? '/images/placeholder.png'}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none prose-headings:text-[#333333] prose-a:text-[#42A5F5] prose-a:no-underline hover:prose-a:underline">
          <ClientPortableText 
            value={post.body} 
            className="prose-img:rounded-lg prose-img:shadow-md"
          />
        </div>

        {/* Featured Products */}
        {post.featuredProductsInPost && post.featuredProductsInPost.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-[#333333] mb-6">Featured Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {post.featuredProductsInPost.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug.current}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                    <div className="relative h-48 w-full">
                      <Image
                        src={urlFor(product.mainImage)?.url() ?? '/images/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-[#333333] group-hover:text-[#42A5F5] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[#42A5F5] font-bold mt-1">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Author Bio */}
        {post.author.bio && (
          <section className="mt-16 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-4">
              {post.author.image && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={urlFor(post.author.image)?.url() ?? '/images/placeholder.png'}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-[#333333] mb-2">About {post.author.name}</h3>
                <p className="text-gray-600">{post.author.bio}</p>
              </div>
            </div>
          </section>
        )}
      </article>
    </main>
  );
} 