'use client';

import { useProducts } from '@/hooks/useProducts';
import { useParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import ProductGrid from '@/components/products/ProductGrid';
import FilterSidebar from '@/components/products/FilterSidebar';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function CategoryErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#42A5F5] hover:bg-[#42A5F5]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#42A5F5]"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryContent() {
  const params = useParams();
  const categorySlug = params?.slug as string;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    color: '',
    size: '',
    inStock: false,
    sort: 'featured'
  });

  const { products, isLoading, isError, mutate } = useProducts({
    category: categorySlug,
    ...filters
  });

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      priceMin: '',
      priceMax: '',
      color: '',
      size: '',
      inStock: false,
      sort: 'featured'
    });
  }, []);

  if (isError) {
    throw new Error('Failed to load category products');
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {categorySlug.replace(/-/g, ' ')}
          </h1>
          <div className="flex items-center gap-4">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
              </SheetContent>
            </Sheet>
            {(filters.priceMin || filters.priceMax || filters.color || filters.size || filters.inStock) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <ProductGrid
              products={products ?? []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Category page error:', error, errorInfo);
  }, []);

  const handleReset = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <ErrorBoundary
      fallback={<div>Something went wrong.</div>}
    >
      <CategoryContent />
    </ErrorBoundary>
  );
} 