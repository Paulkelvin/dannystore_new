import { groq } from 'next-sanity';
import { sanityFetch } from '@/lib/sanity';
import { unstable_cache } from 'next/cache';
import ProductsPageClient from './ProductsPageClient';
import { Product, Category } from '@/types';

const allProductsQuery = groq`*[_type == "product"] {
  _id,
  name,
  "slug": slug.current,
  price,
  mainImage {
    asset,
    alt
  },
  keyBenefits,
  specifications,
  variants[] {
    _key,
    color,
    size,
    price,
    stock
  },
  category-> {
    _id,
    name
  }
}`;

const allCategoriesQuery = groq`*[_type == "category"]{ 
  _id, 
  name,
  "slug": slug.current 
}`;

// Cache functions
const getCachedProducts = unstable_cache(
  async () => {
    return sanityFetch<Product[]>({
      query: allProductsQuery,
      tags: ['all-products'],
    });
  },
  ['all-products'],
  { revalidate: 3600 } // Cache for 1 hour
);

const getCachedCategories = unstable_cache(
  async () => {
    return sanityFetch<Category[]>({
      query: allCategoriesQuery,
      tags: ['all-categories'],
    });
  },
  ['all-categories'],
  { revalidate: 3600 }
);

export default async function ProductsPage() {
  // Fetch products and categories in parallel
  const [products, categories] = await Promise.all([
    getCachedProducts(),
    getCachedCategories()
  ]);

  return <ProductsPageClient products={products} categories={categories} />;
}

// Revalidate data every hour
export const revalidate = 3600;
