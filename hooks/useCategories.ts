import useSWR from 'swr';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    asset: {
      _ref: string;
    };
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }
  return res.json();
};

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    '/api/categories',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache categories for 30 seconds
    }
  );

  return {
    categories: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching a single category
export function useCategory(slug: string) {
  const { data, error, isLoading, mutate } = useSWR<Category>(
    slug ? `/api/categories/${slug}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    category: data,
    isLoading,
    isError: error,
    mutate,
  };
} 