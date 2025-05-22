'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { urlFor } from '@/lib/sanityClient';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { sanityClientPublic as client } from '@/lib/sanityClient';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image: any; // Can be either Sanity image object or URL string
}

interface CategorySectionProps {
  categories: Category[];
}

function SkeletonBox({ className = '' }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} />;
}

function CategoryImageWithSkeleton({ src, alt }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && <SkeletonBox className="absolute inset-0 w-full h-full rounded-lg" />}
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5A467] to-[#E6C78E] flex items-center justify-center">
          <span className="text-white text-lg font-medium">{alt}</span>
        </div>
      )}
    </div>
  );
}

// Update the getImageUrl helper to include optimization parameters
const getImageUrl = (image: any): string => {
  if (!image) return '/images/placeholder.png';
  if (typeof image === 'string') return image;
  try {
    // Add quality and format optimization
    return urlFor(image)?.width(600).height(750).quality(85).format('webp').url() ?? '/images/placeholder.png';
  } catch (error) {
    console.error('Error generating image URL:', error);
    return '/images/placeholder.png';
  }
};

export default function CategorySection({ categories = [] }: CategorySectionProps) {
  const router = useRouter();
  const swiperRef = useRef<SwiperCore>();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Filter strategic categories (excluding best sellers and latest arrivals)
  const strategicCategories = categories.filter(
    (cat) => !cat.slug?.current?.includes('best-sellers') && !cat.slug?.current?.includes('latest-arrivals')
  );

  // Get featured images for best sellers and latest arrivals
  const featuredImages = {
    bestSeller: categories.find(cat => cat.slug?.current?.includes('best-sellers'))?.image,
    latestArrival: categories.find(cat => cat.slug?.current?.includes('latest-arrivals'))?.image
  };

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#333333]">
              Discovery Hub
            </h2>
          </div>
        </div>
        
        <Swiper
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={[Navigation, Pagination, Autoplay]}
          loop={true}
          spaceBetween={16}
          slidesPerView={1.5}
          centeredSlides={false}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 16 },
            768: { slidesPerView: 2.5, spaceBetween: 24 },
            1024: { slidesPerView: 3, spaceBetween: 32 },
          }}
          className="category-swiper pb-8 px-4"
        >
          {/* Strategic Categories */}
          {strategicCategories.map((category, index) => (
            <SwiperSlide key={category._id} className="mb-6 sm:mb-0">
              <Link href={`/category/${category.slug}`} className="block group h-full">
                <div className="relative aspect-[4/5] w-full overflow-hidden shadow-lg">
                  <Image
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={index < 2}
                    quality={85}
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10" />
                  <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20 text-white transform transition-transform duration-300 group-hover:translate-y-2">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight drop-shadow-sm">{category.name}</h3>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleNavigation(`/category/${category.slug}`);
                      }}
                      className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-[#FFC300]/90 text-[#333333] rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-sm hover:bg-[#FFC300] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFC300]/50 focus:ring-offset-2"
                    >
                      View Collection
                    </button>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}

          {/* Best Sellers Card */}
          <SwiperSlide className="mb-6 sm:mb-0">
            <Link href="/products?filter=best-sellers" className="block group h-full">
              <div className="relative aspect-[4/5] w-full overflow-hidden shadow-lg">
                {featuredImages.bestSeller ? (
                  <Image
                    src={getImageUrl(featuredImages.bestSeller)}
                    alt="Best Sellers"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={true}
                    quality={85}
                    loading="eager"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C5A467] to-[#E6C78E] flex items-center justify-center">
                    <span className="text-white text-lg font-medium">Best Sellers</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10" />
                <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20 text-white transform transition-transform duration-300 group-hover:translate-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight drop-shadow-sm">Shop Our Bestsellers</h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigation('/category/best-sellers');
                    }}
                    className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-[#FFC300]/90 text-[#333333] rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-sm hover:bg-[#FFC300] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFC300]/50 focus:ring-offset-2"
                  >
                    View Collection
                  </button>
                </div>
              </div>
            </Link>
          </SwiperSlide>

          {/* Latest Arrivals Card */}
          <SwiperSlide className="mb-6 sm:mb-0">
            <Link href="/products?filter=latest-arrivals" className="block group h-full">
              <div className="relative aspect-[4/5] w-full overflow-hidden shadow-lg">
                {featuredImages.latestArrival ? (
                  <Image
                    src={getImageUrl(featuredImages.latestArrival)}
                    alt="Latest Arrivals"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={true}
                    quality={85}
                    loading="eager"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#42A5F5] to-[#64B5F6] flex items-center justify-center">
                    <span className="text-white text-lg font-medium">Latest Arrivals</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10" />
                <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20 text-white transform transition-transform duration-300 group-hover:translate-y-2">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 tracking-tight drop-shadow-sm">Latest Arrivals</h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigation('/category/latest-arrivals');
                    }}
                    className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-[#FFC300]/90 text-[#333333] rounded-full text-xs sm:text-sm font-medium tracking-wide shadow-sm hover:bg-[#FFC300] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFC300]/50 focus:ring-offset-2"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        </Swiper>
      </div>
      {/* Remove the global styles for swiper navigation buttons since we're not using them anymore */}
      <style jsx global>{`
        .category-swiper .swiper-slide {
          transition: transform 0.3s ease;
        }
        .category-swiper .swiper-slide > div {
          width: 100%;
          max-width: 340px;
          margin: 0 auto;
        }
        .category-swiper .swiper-button-next,
        .category-swiper .swiper-button-prev {
          width: 30px !important;
          height: 30px !important;
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 50% !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }
        .category-swiper .swiper-button-next:after,
        .category-swiper .swiper-button-prev:after {
          font-size: 14px !important;
          color: #333333 !important;
        }
      `}</style>
    </section>
  );
} 