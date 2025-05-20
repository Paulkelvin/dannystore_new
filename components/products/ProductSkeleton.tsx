'use client';

import { Star } from 'lucide-react';

export default function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-[#F8F9FA] pt-20 pb-8 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Product gallery skeleton */}
            <div className="w-full lg:w-1/2">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Product info skeleton */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gray-200" />
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-8 bg-gray-200 rounded w-32 mb-6" />
              
              {/* Variants skeleton */}
              <div className="space-y-4 mb-6">
                <div className="h-6 bg-gray-200 rounded w-24 mb-2" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded w-20" />
                  ))}
                </div>
              </div>

              {/* Add to cart button skeleton */}
              <div className="h-12 bg-gray-200 rounded-lg mb-8" />

              {/* Trust signals skeleton */}
              <div className="flex flex-wrap gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-gray-200 rounded-full" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                ))}
              </div>

              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 