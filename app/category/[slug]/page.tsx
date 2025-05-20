import { groq } from 'next-sanity';
import { sanityFetch } from '@/lib/sanity';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import { Product, Category } from '@/types';
import CategoryPageContent from '@/components/category/CategoryPageContent';

// GROQ queries
const categoryQuery = groq`*[_type == "category" && slug.current == $slug][0] {
  _id,
  name,
  description,
  image,
  "products": *[_type == "product" && references(^._id)] {
    _id,
    name,
    price,
    "slug": slug.current,
    mainImage,
    category->,
    keyBenefits,
    specifications,
    variants[]
  }
}`;

const bestSellersQuery = groq`*[_type == "product"] | order(salesCount desc, rating desc)[0...12]{
  _id, 
  name, 
  price, 
  "slug": slug.current, 
  mainImage, 
  category->, 
  variants[]
}`;

const latestArrivalsQuery = groq`*[_type == "product"] | order(_createdAt desc)[0...12]{
  _id, 
  name, 
  price, 
  "slug": slug.current, 
  mainImage, 
  category->, 
  variants[]
}`;

// Cache functions
const getCachedCategory = unstable_cache(
  async (slug: string) => {
    return sanityFetch<Category & { products: Product[] }>({
      query: categoryQuery,
      params: { slug },
      tags: [`category-${slug}`],
    });
  },
  ['category'],
  { revalidate: 3600 }
);

const getCachedBestSellers = unstable_cache(
  async () => {
    return sanityFetch<Product[]>({
      query: bestSellersQuery,
      tags: ['best-sellers'],
    });
  },
  ['best-sellers'],
  { revalidate: 3600 }
);

const getCachedLatestArrivals = unstable_cache(
  async () => {
    return sanityFetch<Product[]>({
      query: latestArrivalsQuery,
      tags: ['latest-arrivals'],
    });
  },
  ['latest-arrivals'],
  { revalidate: 3600 }
);

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  let category;

  if (slug === 'best-sellers') {
    const products = await getCachedBestSellers();
    category = {
      _id: 'best-sellers',
      name: 'Best Sellers',
      description: 'Our most popular products',
      products,
    };
  } else if (slug === 'latest-arrivals') {
    const products = await getCachedLatestArrivals();
    category = {
      _id: 'latest-arrivals',
      name: 'Latest Arrivals',
      description: 'Check out our newest additions',
      products,
    };
  } else {
    category = await getCachedCategory(slug);
  }

  if (!category) {
    notFound();
  }

  return <CategoryPageContent category={category} />;
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await sanityFetch<{ slug: { current: string } }[]>({
    query: groq`*[_type == "category"]{ "slug": slug.current }`,
    tags: ['all-categories'],
  });

  return categories.map(({ slug }) => ({
    slug,
  }));
}

// Metadata for the page
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCachedCategory(slug);

  return {
    title: category ? `${category.name} | Danny's Store` : "Category Not Found",
    description: category?.description || "Browse our collection of products",
  };
}

// Revalidate data every hour
export const revalidate = 3600; 