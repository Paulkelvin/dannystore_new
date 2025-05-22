'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ChevronLeft, ChevronRight, X, ShoppingBag, Eye, Heart, BarChart2 } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';
import { urlFor } from '@/lib/sanityClient';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';

// Local SkeletonBox component
function SkeletonBox({ className = '' }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} />;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  slug: string;
  mainImage: any;
  rating?: number;
  reviewCount?: number;
  salesCount?: number;
  description?: string;
  enableQuickView?: boolean;
  showAddToCartButton?: boolean;
  customActions?: Array<{
    label: string;
    url: string;
    isPrimary: boolean;
    icon?: string;
    customLabel?: string;
  }>;
  variants?: Array<{
    _key: string;
    color: string;
    size: string;
    stock: number;
    price?: number;
    sku?: string;
  }>;
}

interface BestsellersSectionProps {
  products?: Product[];
}

interface ProductImageWithSkeletonProps {
  src: string;
  alt: string;
  width: number;
  height: number;
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
        }`}
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

export default function BestsellersSection({ products = [] }: BestsellersSectionProps) {
  // All hooks must be at the top
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // useCallback must also be here
  const closeQuickView = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setQuickViewProduct(null);
      setIsClosing(false);
    }, 400); // match close animation duration
  }, []);

  // Log component props and state
  useEffect(() => {
    console.log('🔄 BestsellersSection:', {
      productsCount: products?.length || 0,
      hasProducts: Array.isArray(products) && products.length > 0,
      firstProduct: products?.[0] ? {
        id: products[0]._id,
        name: products[0].name,
        hasImage: !!products[0].mainImage,
        hasVariants: !!products[0].variants?.length
      } : null
    });
  }, [products]);

  useEffect(() => {
    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (products) {
      console.log('BestsellersSection received products:', products.length);
      if (!Array.isArray(products)) {
        setError('Invalid products data received');
      }
    }
  }, [products]);

  if (error) {
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-red-600">Error loading products. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    console.log('⏳ BestsellersSection: Loading state');
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    console.log('⚠️ BestsellersSection: No products available');
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600">No products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    if (product.variants?.[0]) {
      setSelectedVariant(product.variants[0]);
    }
  };

  const handleAddToCart = async (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isAddingToCart === product._id) return;
    
    try {
      setIsAddingToCart(product._id);
      
      // For products with variants, use the first variant
      const variant = product.variants?.[0];
      const cartItem = {
        productId: product._id,
        variantId: variant?._key || `${product._id}-default`,
        name: product.name,
        variantTitle: variant 
          ? `${variant.color} / ${variant.size}`.trim()
          : undefined,
        price: variant?.price || product.price,
        sku: variant?.sku || `${product._id}-default`,
        image: product.mainImage,
        color: variant?.color,
        size: variant?.size
      };

      console.log('Adding to cart:', cartItem);
      addItem(cartItem);
      toast.success('Added to cart!');
      
      if (quickViewProduct?._id === product._id) {
        setQuickViewProduct(null);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setIsAddingToCart(null);
    }
  };

  const getActionIcon = (icon: string) => {
    switch (icon) {
      case 'shopping-bag':
        return <ShoppingBag className="h-4 w-4" />;
      case 'eye':
        return <Eye className="h-4 w-4" />;
      case 'heart':
        return <Heart className="h-4 w-4" />;
      case 'compare':
        return <BarChart2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const slidesPerView = 4.2; // match largest breakpoint
  const shouldCenter = products.length < slidesPerView;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Best Sellers</h2>
            <p className="hidden sm:block text-gray-600">Our most popular products this month</p>
          </div>
          <Link
            href="/category/best-sellers"
            className="text-sm sm:text-base text-[#42A5F5] font-medium transition-colors hover:text-[#63b3fa] focus:text-[#63b3fa]"
          >
            View All &rarr;
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
            className="bestseller-swiper px-1"
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
                      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-200 relative group" style={{ position: 'relative' }}>
                        {/* Best Seller Badge */}
                        <span className="absolute top-2 right-2 z-10 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-[#FFC300] text-[#333333] rounded">
                          Best Seller
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
                          disabled={isAddingToCart === product._id}
                          className="absolute bottom-0 left-0 right-0 bg-black/80 text-white py-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                          {isAddingToCart === product._id ? 'Adding...' : 'Add to Cart'}
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
                            onClick={() => handleQuickView(product)}
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
        .bestseller-swiper .swiper-button-prev,
        .bestseller-swiper .swiper-button-next {
          width: 48px !important;
          height: 48px !important;
          min-width: 48px !important;
          min-height: 48px !important;
          max-width: 48px !important;
          max-height: 48px !important;
          border-radius: 50% !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #FFC300 !important;
          color: white !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          font-size: 1.5rem;
          opacity: 0.9;
          transition: all 0.2s ease;
        }
        .bestseller-swiper .swiper-button-prev::after,
        .bestseller-swiper .swiper-button-next::after {
          font-size: 1.25rem !important;
          font-weight: bold;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          margin: 0 !important;
          line-height: 1 !important;
        }
        .bestseller-swiper .swiper-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .bestseller-swiper .swiper-slide {
          transition: transform 0.3s ease;
        }
        .bestseller-swiper .swiper-slide > div {
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
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg relative" style={{ position: 'relative', height: '400px' }}>
                  {quickViewProduct.mainImage ? (
                    <ProductImageWithSkeleton
                      src={urlFor(quickViewProduct.mainImage)?.width(800).height(800).url() ?? '/images/placeholder.png'}
                      alt={quickViewProduct.name}
                      width={800}
                      height={800}
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
                  {typeof quickViewProduct.salesCount === 'number' && quickViewProduct.salesCount > 0 && (
                    <span className="text-sm text-gray-500">
                      {quickViewProduct.salesCount} sold
                    </span>
                  )}
                </div>
                {/* Add to Cart Button in Quick View */}
                <button
                  onClick={() => handleAddToCart(quickViewProduct)}
                  disabled={isAddingToCart === quickViewProduct._id}
                  className="mt-4 w-full bg-[#42A5F5] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#1e88e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart === quickViewProduct._id ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
} 