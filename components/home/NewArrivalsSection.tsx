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
}

function SkeletonBox({ className = '' }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} />;
}

function ProductImageWithSkeleton({ src, alt, width, height }: ProductImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setHasLoaded(false);
  }, [src]);

  // Only log on first load
  useEffect(() => {
    if (!hasLoaded) {
      console.log('Loading image:', { src, alt });
    }
  }, [src, alt, hasLoaded]);

  return (
    <div className="relative w-full h-full">
      {isLoading && <SkeletonBox className="absolute inset-0 w-full h-full rounded-lg" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover rounded-lg transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={true}
        quality={85}
        onLoad={() => {
          if (!hasLoaded) {
            console.log('Image loaded successfully:', alt);
            setHasLoaded(true);
          }
          setIsLoading(false);
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Arrivals</h2>
            <p className="text-gray-600">Check out our newest products</p>
          </div>
          <Link
            href="/category/latest-arrivals"
            className="text-lg text-[#42A5F5] font-medium transition-colors hover:underline hover:text-[#63b3fa] focus:underline focus:text-[#63b3fa]"
          >
            View All New Arrivals &rarr;
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
          <button className="swiper-button-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-[#FFC300] text-[#333] rounded-full shadow-lg border-none flex items-center justify-center opacity-90 hover:opacity-100 transition-all duration-200 text-2xl" />
          <button className="swiper-button-next absolute right-2 top-1/2 -translate-y-1/2 z-10 w-14 h-14 bg-[#FFC300] text-[#333] rounded-full shadow-lg border-none flex items-center justify-center opacity-90 hover:opacity-100 transition-all duration-200 text-2xl" />
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
        .swiper-button-prev,
        .swiper-button-next {
          box-shadow: none;
          border: none;
          opacity: 0.8;
          background: #FFC300 !important;
          color: #333 !important;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          opacity: 1;
          background: #FFD54F !important;
        }
        .swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            {/* Overlay with fade-in transition and click-to-close */}
            <div
              className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-600 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
              onClick={closeQuickView}
              aria-label="Close quick view modal"
            />

            {/* Modal with scale and fade transition */}
            <div
              className={`relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all ${isClosing ? 'duration-400 animate-modal-out' : 'duration-600 animate-modal-in'} sm:my-8 sm:w-full sm:max-w-lg sm:p-6 scale-100 opacity-100`}
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
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg relative" style={{ height: '400px' }}>
                  {quickViewProduct.mainImage ? (
                    <ProductImageWithSkeleton
                      src={urlFor(quickViewProduct.mainImage)?.width(600).height(600).url() ?? '/images/placeholder.png'}
                      alt={quickViewProduct.name}
                      width={600}
                      height={600}
                    />
                  ) : (
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
                  onClick={() => handleAddToCart(quickViewProduct)}
                  disabled={isAddingToCart[quickViewProduct._id]}
                  className="mt-4 w-full bg-[#42A5F5] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#1e88e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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