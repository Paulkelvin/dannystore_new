'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityClient';
import { Product } from '@/types';
import { sanityClientPublic as client } from '@/lib/sanityClient';

interface SearchResult {
  _id: string;
  name: string;
  price: number;
  slug: { current: string };
  mainImage: any;
  category: {
    _id: string;
    name: string;
  };
}

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchQuery = `*[_type == "product" && (
          name match $query || 
          description match $query || 
          category->name match $query || 
          tags[] match $query
        )][0...8] {
          _id,
          name,
          price,
          "slug": slug.current,
          mainImage,
          category-> {
            _id,
            name
          }
        }`;

        const results = await client.fetch(searchQuery, { query: `*${query}*` } as Record<string, any>);
        setResults(results.map((result: SearchResult) => ({
          _id: result._id,
          name: result.name,
          price: result.price,
          slug: result.slug.current,
          mainImage: result.mainImage,
          category: {
            _id: result.category._id,
            name: result.category.name
          }
        })));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleProductClick = (slug: string) => {
    router.push(`/product/${slug}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-x-0 top-0 z-50 bg-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-300 py-3 pl-10 pr-4 focus:border-[#C5A467] focus:outline-none focus:ring-1 focus:ring-[#C5A467]"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20">
        <div className="py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#C5A467] border-r-transparent"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleProductClick(typeof product.slug === 'string' ? product.slug : product.slug.current)}
                  className="flex items-center gap-4 rounded-lg border p-4 text-left hover:bg-gray-50"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={(function() {
                        const builder = urlFor(product.mainImage);
                        if (builder && typeof builder.width === 'function' && typeof builder.height === 'function') {
                          const url = builder.width(64).height(64).url();
                          return url ?? '';
                        }
                        return '';
                      })()}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category?.name}</p>
                    <p className="mt-1 font-medium text-gray-900">${product.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="text-center py-8 text-gray-500">
              No products found for "{query}"
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
} 