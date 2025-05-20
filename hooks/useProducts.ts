import useSWR from 'swr';
import { Product } from '@/types';
import { batchFetchProducts } from '@/lib/sanity';

const CACHE_KEY = 'products';

interface UseProductsOptions {
  category?: string;
  sort?: string;
  limit?: number;
  skip?: number;
  search?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
};

export function useProducts({
  category,
  sort = 'createdAt desc',
  limit = 12,
  skip = 0,
  search,
}: UseProductsOptions = {}) {
  // Build query parameters
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (sort) params.append('sort', sort);
  if (limit) params.append('limit', limit.toString());
  if (skip) params.append('skip', skip.toString());
  if (search) params.append('search', search);

  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    [`/api/products`, params.toString()],
    () => fetcher(`/api/products?${params.toString()}`),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Dedupe requests within 1 minute
      keepPreviousData: true, // Keep showing previous data while loading new data
    }
  );

  return {
    products: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Prefetch function for critical product data
export async function prefetchProducts(options: UseProductsOptions = {}) {
  const query = `*[_type == "product" ${
    options.category ? `&& category->slug.current == $category` : ''
  }] | order(${options.sort || 'createdAt desc'}) [0...${options.limit || 12}] {
    _id,
    name,
    price,
    "slug": slug.current,
    mainImage,
    category->,
    variants[]
  }`;

  return batchFetchProducts(
    (await fetch('/api/products?' + new URLSearchParams({
      query,
      ...options,
    })).json()).map((p: any) => p._id)
  );
}

// Hook for fetching a single product
export function useProduct(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<Product>(
    slug ? `/api/products/${slug}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    product: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching related products
export function useRelatedProducts(productId: string, category: string) {
  const { data, error, isLoading } = useSWR<Product[]>(
    productId && category ? `/api/products/related?productId=${productId}&category=${category}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    relatedProducts: data,
    isLoading,
    isError: error,
  };
} 