'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { urlFor } from '@/lib/sanityClient';

interface RelatedProductsProps {
  currentProduct: Product;
  products?: Product[];
}

export default function RelatedProducts({ currentProduct, products = [] }: RelatedProductsProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const { addItem } = useCart();

  // Filter out current product and get 4 related products
  const relatedProducts = products
    .filter(product => product._id !== currentProduct._id)
    .slice(0, 4);

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Create cart item
      const cartItem = {
        productId: product._id,
        // For products without variants, use the product ID as both variantId and sku
        variantId: product.variants?.[0]?._key || `${product._id}-default`,
        name: product.name,
        price: product.price,
        sku: product.variants?.[0]?.sku || product._id,
        image: product.mainImage,
        // Add variant info if available
        ...(product.variants?.[0] && {
          variantTitle: `${product.variants[0].color?.name || ''} ${product.variants[0].size?.name || ''}`.trim(),
          color: product.variants[0].color?.value,
          size: product.variants[0].size?.name
        })
      };

      addItem(cartItem);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (relatedProducts.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <div
              key={product._id}
              className="group relative"
              onMouseEnter={() => setHoveredProduct(product._id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <Link href={`/products/${typeof product.slug === 'string' ? product.slug : product.slug.current}`} className="block">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={urlFor(product.mainImage).url()}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <button
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // TODO: Implement wishlist functionality
                      toast.info('Wishlist feature coming soon!');
                    }}
                    aria-label="Add to wishlist"
                  >
                    <Heart className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  {product.rating && (
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      {product.reviewCount && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({product.reviewCount})
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-lg font-semibold text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
              {hoveredProduct === product._id && (
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="absolute bottom-0 left-0 right-0 bg-black text-white py-2 px-4 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 