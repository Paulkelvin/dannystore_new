// =========================================
// FILE: src/components/products/ProductCard.tsx
// =========================================
'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Use Next.js Image for optimization
import { urlFor } from '@/lib/sanityClient'; // Import the image URL builder
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Use shadcn Card
import { Button } from '@/components/ui/button'; // Use shadcn Button
import { ShoppingCart, Loader2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types'; // Import the Product type
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import OptimizedImage from '@/components/ui/OptimizedImage';
import OptimizedLink from '@/components/ui/OptimizedLink';

interface ProductCardProps {
  product: Product & {
    slug: { current: string } | string;
  };
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addItem } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  
  // Get the slug value, handling both Sanity slug object and string
  const productSlug = typeof product.slug === 'string' ? product.slug : product.slug.current;
  
  if (!productSlug) {
    console.error('Product missing slug:', product);
    return null;
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  const handleAddToCart = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    try {
      setIsAddingToCart(true);
      // Create cart item with consistent structure
      const cartItem = {
        productId: product._id,
        variantId: product.variants?.[0]?._key || `${product._id}-default`,
        name: product.name,
        variantTitle: product.variants?.[0] 
          ? `${product.variants[0].color?.name || ''} / ${product.variants[0].size?.name || ''}`.trim()
          : undefined,
        price: product.variants?.[0]?.price || product.price,
        sku: product.variants?.[0]?.sku || `${product._id}-default`,
        image: product.mainImage,
        color: product.variants?.[0]?.color?.name,
        size: product.variants?.[0]?.size?.name
      };
      addItem(cartItem);
      toast.success('Added to cart!');
      if (quickViewProduct?._id === product._id) {
        setQuickViewProduct(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  }, [addItem, product, isAddingToCart, quickViewProduct]);

  // Helper to close modal with animation
  const closeQuickView = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setQuickViewProduct(null);
      setIsClosing(false);
    }, 500); // match close animation duration
  }, []);

  return (
    <>
      <div className="group relative">
        <OptimizedLink 
          href={`/products/${productSlug}`}
          prefetchOnHover={true}
          preloadOnHover={true}
          className="block"
        >
          <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100">
            {product.mainImage ? (
              <OptimizedImage
                image={product.mainImage}
                alt={product.name}
                width={600}
                height={600}
                priority={priority}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={85}
                loading={priority ? 'eager' : 'lazy'}
                containerClassName="w-full h-full"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
            <div className="flex items-center justify-between mt-1">
              <span className="text-lg font-medium text-gray-900">${product.price.toFixed(2)}</span>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="p-2 rounded-full bg-[#42A5F5] text-white hover:bg-[#1e88e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </OptimizedLink>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Overlay with fade-in transition and click-to-close */}
            <div
              className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-800 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
              onClick={closeQuickView}
              aria-label="Close quick view modal"
            />

            {/* Modal with scale and fade transition */}
            <div
              className={`relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all ${isClosing ? 'duration-500 animate-modal-out' : 'duration-800 animate-modal-in'} sm:my-8 sm:w-full sm:max-w-lg sm:p-6 scale-100 opacity-100`}
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 cursor-pointer p-2 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  onClick={closeQuickView}
                  aria-label="Close"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg relative">
                  {product.mainImage && (
                    <OptimizedImage
                      image={product.mainImage}
                      alt={product.name}
                      width={600}
                      height={600}
                      priority={priority}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={85}
                      loading={priority ? 'eager' : 'lazy'}
                      containerClassName="w-full h-full"
                    />
                  )}
                  {!product.mainImage && (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {quickViewProduct.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-medium text-gray-900">
                    ${quickViewProduct.price.toFixed(2)}
                  </p>
                  {quickViewProduct.salesCount && quickViewProduct.salesCount > 0 && (
                    <span className="text-sm text-gray-500">
                      {quickViewProduct.salesCount} sold
                    </span>
                  )}
                </div>
                {/* Add to Cart Button in Quick View */}
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="mt-4 w-full bg-[#42A5F5] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#1e88e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-fade-out {
          animation: fade-out 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes modal-out {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
        .animate-modal-in {
          animation: modal-in 0.8s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-modal-out {
          animation: modal-out 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </>
  );
}
