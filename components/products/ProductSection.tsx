'use client';

import { Product } from '@/types';
import { useState, useRef } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSectionProps {
  initialProducts: Product[];
  sectionType: 'latest' | 'bestSeller';
  title: string;
}

export default function ProductSection({
  initialProducts,
  sectionType,
  title,
}: ProductSectionProps) {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(initialProducts);
  const [offset, setOffset] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  const loadMore = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/products?type=${sectionType}&offset=${offset}&limit=4`
      );
      const data = await response.json();

      if (data.products.length === 0) {
        setHasMore(false);
        return;
      }

      setDisplayedProducts((prev) => [...prev, ...data.products]);
      setOffset((prev) => prev + 4);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;

    const scrollAmount = direction === 'left' ? -400 : 400;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div 
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedProducts.map((product) => (
            <div 
              key={product._id} 
              className="flex-none w-[280px] snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {hasMore && !isLoading && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              className="text-[#C5A467] hover:text-[#b39355] font-medium"
            >
              View All
            </button>
          </div>
        )}
      </div>
    </section>
  );
} 