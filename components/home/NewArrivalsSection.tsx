'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import { urlFor } from '@/lib/sanityClient';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  slug: string;
  mainImage: any;
  sku?: string;
  salesCount?: number;
  variants?: Array<{
    _key: string;
    color: {
      name: string;
    };
    size: {
      name: string;
    };
    stock: number;
    price?: number;
    sku?: string;
  }>;
}

interface NewArrivalsSectionProps {
  products: Product[];
}

interface ProductImageWithSkeletonProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

function SkeletonBox({ className = '' }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} />;
}

function ProductImageWithSkeleton({ src, alt, width, height, className = '' }: ProductImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setHasLoaded(false);
  }, [src]);

  return (
    <div className="relative w-full h-full" style={{ position: 'relative' }}>
      {isLoading && <SkeletonBox className="absolute inset-0 w-full h-full rounded-lg" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover rounded-lg transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        priority={true}
        quality={75}
        loading="eager"
        onLoad={() => {
          setIsLoading(false);
          setHasLoaded(true);
        }}
        onError={(e) => {
          console.error('Error loading image:', { src, alt, error: e });
          setError(true);
          setIsLoading(false);
        }}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center rounded-lg">
          <span className="text-gray-400">Failed to load image</span>
        </div>
      )}
    </div>
  );
}

export default function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState<Record<string, boolean>>({});
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleQuickView = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setQuickViewProduct(product);
    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    if (firstVariant) {
      setSelectedVariants(prev => ({
        ...prev,
        [product._id]: firstVariant
      }));
    }
  };

  const handleAddToCart = async (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isAddingToCart[product._id]) return;

    try {
      setIsAddingToCart(prev => ({ ...prev, [product._id]: true }));

      // For products with variants, use the selected variant or first variant
      const variant = selectedVariants[product._id] || product.variants?.[0];

      // Create cart item with consistent structure
      const cartItem = {
        productId: product._id,
        variantId: variant?._key || `${product._id}-default`,
        name: product.name,
        variantTitle: variant 
          ? `${variant.color?.name || ''} / ${variant.size?.name || ''}`.trim()
          : undefined,
        price: variant?.price || product.price,
        sku: variant?.sku || `${product._id}-default`,
        image: product.mainImage,
        color: variant?.color?.name,
        size: variant?.size?.name
      };

      console.log('Adding to cart:', cartItem);
      addItem(cartItem);
      toast.success('Added to cart!');
      
      if (quickViewProduct?._id === product._id) {
        setQuickViewProduct(null);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  // Helper to close modal with animation
  const closeQuickView = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setQuickViewProduct(null);
      setIsClosing(false);
    }, 400); // match close animation duration
  }, []);

  const slidesPerView = 4.2; // match largest breakpoint
  const shouldCenter = products.length < slidesPerView;

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Latest Arrivals</h2>
            <p className="hidden sm:block text-gray-600">Check out our newest products</p>
          </div>
          <Link
            href="/category/latest-arrivals"
            className="text-sm sm:text-base text-[#42A5F5] font-medium transition-colors hover:text-[#63b3fa] focus:text-[#63b3fa] flex items-center gap-1"
          >
            View All <span className="text-lg">&rarr;</span>
          </Link>
        </div>
        {/* Swiper container with no extra px-4, just full width inside max-w-7xl */}
        <div className="relative w-full">
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView={1.5}
            centeredSlides={shouldCenter}
            slidesOffsetBefore={0}
            slidesOffsetAfter={0}
            navigation={{
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next',
            }}
            breakpoints={{
              640: {
                slidesPerView: 2.2,
                slidesOffsetBefore: 0,
                slidesOffsetAfter: 0,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 3.2,
                slidesOffsetBefore: 0,
                slidesOffsetAfter: 0,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4.2,
                slidesOffsetBefore: 0,
                slidesOffsetAfter: 0,
                spaceBetween: 24,
              },
            }}
            className="newarrivals-swiper px-1"
          >
            {products.map((product) => {
              let imageUrl = '/images/placeholder.png';
              if (product.mainImage && product.mainImage.asset) {
                const url = urlFor(product.mainImage)?.width(800).height(800).url() ?? '/images/placeholder.png';
                if (url) imageUrl = url;
              }
              return (
                <SwiperSlide key={product._id}>
                  <div className="group relative px-2 sm:px-3">
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 relative group">
                        {/* New Badge */}
                        <span className="absolute top-2 right-2 z-10 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-[#FFC300] text-[#333333] rounded">
                          New
                        </span>
                        <ProductImageWithSkeleton
                          src={imageUrl}
                          alt={product.name}
                          width={800}
                          height={800}
                        />
                        {/* Add to Cart Button */}
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={isAddingToCart[product._id]}
                          className="absolute bottom-0 left-0 right-0 bg-black/80 text-white py-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                          {isAddingToCart[product._id] ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </Link>
                    <div className="mt-3">
                      {/* Product Name */}
                      <h3 className="text-sm sm:text-base font-semibold text-[#333333] line-clamp-2">
                        <Link href={`/products/${product.slug}`} className="hover:text-[#42A5F5] transition-colors">
                          {product.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </Link>
                      </h3>
                      {/* Price and View Details */}
                      <div className="flex flex-col items-start mt-1 sm:mt-2">
                        <p className="text-base sm:text-lg font-medium text-[#333333] mb-1 sm:mb-2">${product.price.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-xs sm:text-sm font-semibold text-[#42A5F5] hover:underline focus:underline transition-colors"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={(e) => handleQuickView(product, e)}
                            className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#42A5F5] transition-colors"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
          {/* Navigation buttons absolutely inside slider, styled round and with brand color */}
          <button className="swiper-button-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-transparent text-gray-600 hover:text-gray-900 rounded-full border-none flex items-center justify-center transition-all duration-200 text-lg" />
          <button className="swiper-button-next absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-transparent text-gray-600 hover:text-gray-900 rounded-full border-none flex items-center justify-center transition-all duration-200 text-lg" />
        </div>
      </div>

      {/* Updated styles */}
      <style jsx global>{`
        .swiper-container {
          width: 100%;
          max-width: none;
          margin: 0;
          transform: none;
          padding: 0;
          overflow: visible;
        }
        @media (min-width: 640px) {
          .swiper-container {
            padding: 0;
          }
        }
        @media (min-width: 1024px) {
          .swiper-container {
            padding: 0;
          }
        }
        .newarrivals-swiper .swiper-button-next,
        .newarrivals-swiper .swiper-button-prev {
          width: 32px !important;
          height: 32px !important;
          background-color: rgba(255, 255, 255, 0.8) !important;
          border-radius: 50%;
          color: #333333 !important;
          font-size: 16px !important;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }
        .newarrivals-swiper .swiper-button-next:hover,
        .newarrivals-swiper .swiper-button-prev:hover {
          opacity: 1;
        }
        .newarrivals-swiper .swiper-button-next::after,
        .newarrivals-swiper .swiper-button-prev::after {
          font-size: 16px !important;
        }
        .newarrivals-swiper .swiper-button-disabled {
          opacity: 0.35 !important;
        }
        .swiper-slide {
          transition: transform 0.3s ease;
        }
        .swiper-slide > div {
          width: 100%;
          max-width: 340px;
          margin: 0 auto;
        }
      `}</style>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-0 text-center sm:items-center sm:p-0">
            {/* Overlay with fade-in transition and click-to-close */}
            <div
              className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-600 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
              onClick={closeQuickView}
              aria-label="Close quick view modal"
            />

            {/* Modal with scale and fade transition */}
            <div
              className={`relative transform overflow-hidden bg-white shadow-xl transition-all ${
                isClosing ? 'duration-400 animate-modal-out' : 'duration-600 animate-modal-in'
              } w-full h-[90vh] sm:h-auto sm:max-w-lg sm:rounded-lg sm:my-8 scale-100 opacity-100 flex flex-col`}
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="absolute right-0 top-0 pr-4 pt-4 z-10">
                <button
                  type="button"
                  className="rounded-md bg-white/80 backdrop-blur-sm text-gray-400 hover:text-gray-500 cursor-pointer p-2 min-w-[40px] min-h-[40px] flex items-center justify-center"
                  onClick={closeQuickView}
                  aria-label="Close"
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Image container - takes up 60% of height on mobile, fixed height on desktop */}
              <div className="relative w-full h-[60vh] sm:h-[400px] overflow-hidden">
                {quickViewProduct.mainImage ? (
                  <ProductImageWithSkeleton
                    src={urlFor(quickViewProduct.mainImage)?.width(800).height(800).url() ?? '/images/placeholder.png'}
                    alt={quickViewProduct.name}
                    width={800}
                    height={800}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Content container - scrollable on mobile */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {quickViewProduct.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-medium text-gray-900">
                    ${quickViewProduct.price.toFixed(2)}
                  </p>
                  {typeof quickViewProduct.salesCount === 'number' && quickViewProduct.salesCount > 0 && (
                    <span className="text-sm text-gray-500">
                      {quickViewProduct.salesCount} sold
                    </span>
                  )}
                </div>
                {/* Add to Cart Button */}
                <button
                  onClick={(e) => handleAddToCart(quickViewProduct, e)}
                  disabled={isAddingToCart[quickViewProduct._id]}
                  className="mt-4 w-full bg-[#42A5F5] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1e88e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart[quickViewProduct._id] ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
} 