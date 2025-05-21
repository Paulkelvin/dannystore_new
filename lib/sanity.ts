import { createClient, SanityClient } from 'next-sanity';
import { cache } from 'react';
import imageUrlBuilder from '@sanity/image-url';
import type { Image } from '@sanity/types';
import type { QueryParams } from '@sanity/client';

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable');
}

if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  console.warn('⚠️ NEXT_PUBLIC_SANITY_DATASET not set, using "production" as default');
}

export const client: SanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
  perspective: 'published',
  stega: {
    enabled: false,
  },
});

// Create image URL builder
const builder = imageUrlBuilder(client);

export const cachedClient = cache(client.fetch.bind(client));

export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
  revalidate = 3600,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number;
}): Promise<T> {
  return cachedClient(query, params, {
    next: {
      revalidate,
      tags,
    },
  }) as Promise<T>;
}

export async function prefetchData(queries: Array<{ query: string; params?: QueryParams }>) {
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

export function getOptimizedImageUrl(image: Image | null, width: number = 800): string | null {
  if (!image?.asset?._ref) return null;
  
  const cacheKey = `${image.asset._ref}-${width}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey) || null;
  }
  
  const url = builder.image(image).width(width).quality(85).url();
  imageCache.set(cacheKey, url);
  return url;
} 