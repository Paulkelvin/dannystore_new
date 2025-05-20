import { createClient } from 'next-sanity';
import { cache } from 'react';

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable');
}

if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  console.warn('⚠️ NEXT_PUBLIC_SANITY_DATASET not set, using "production" as default');
}

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  perspective: 'published',
  stega: {
    enabled: false,
  },
});

export const cachedClient = cache(client.fetch.bind(client));

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 3600,
}: {
  query: string;
  params?: Record<string, any>;
  tags?: string[];
  revalidate?: number;
}): Promise<T> {
  return cachedClient<T>(query, params, {
    next: {
      revalidate,
      tags,
    },
  });
}

export async function prefetchData(queries: Array<{ query: string; params?: Record<string, any> }>) {
  const prefetchPromises = queries.map(({ query, params = {} }) =>
    cachedClient(query, params, {
      next: { revalidate: 3600 },
    })
  );
  
  return Promise.all(prefetchPromises);
}

export async function batchFetchProducts(productIds: string[]) {
  const query = `*[_type == "product" && _id in $productIds] {
    _id,
    name,
    price,
    "slug": slug.current,
    mainImage,
    category->,
    variants[]
  }`;
  
  return cachedClient(query, { productIds }, {
    next: { revalidate: 3600, tags: ['products'] },
  });
}

const imageCache = new Map<string, string>();

export function getOptimizedImageUrl(image: any, width: number = 800) {
  if (!image?.asset?._ref) return null;
  
  const cacheKey = `${image.asset._ref}-${width}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }
  
  const url = client.image(image).width(width).quality(85).url();
  imageCache.set(cacheKey, url);
  return url;
} 