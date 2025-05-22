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
  SwiperCore.use([Navigation, Pagination, Autoplay]);
  const [featuredImages, setFeaturedImages] = useState({
    bestSeller: null,
    latest: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure categories is an array and has at least one item
  const safeCategories = Array.isArray(categories) ? categories : [];
  const strategicCategories = safeCategories.slice(0, 3);

  // Fetch featured images for best sellers and latest arrivals
  useEffect(() => {
    const fetchFeaturedImages = async () => {
      try {
        setIsLoading(true);
        // Modified queries to get any product if no best seller or latest is found
        const bestSellerQuery = `*[_type == "product" && isBestSeller == true][0] {
          mainImage
        } || *[_type == "product"][0] {
          mainImage
        }`;
        const latestQuery = `*[_type == "product"] | order(_createdAt desc)[0] {
          mainImage
        } || *[_type == "product"][0] {
          mainImage
        }`;

        const [bestSeller, latest] = await Promise.all([
          client.fetch(bestSellerQuery),
          client.fetch(latestQuery)
        ]);

        setFeaturedImages({
          bestSeller: bestSeller?.mainImage,
          latest: latest?.mainImage
        });
      } catch (err) {
        console.error('Error fetching featured images:', err);
        // Don't set error state, just use fallback background
        setFeaturedImages({
          bestSeller: null,
          latest: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedImages();
  }, []);

  if (error) {
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Add a navigation handler
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center tracking-tight">
            Discovery Hub
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 text-center max-w-2xl mx-auto">
            Explore our curated collections and discover your next favorite piece
          </p>
        </div>
        <Swiper
          loop={true}
          spaceBetween={16}
          slidesPerView={1.5}
          centeredSlides={false}
          navigation
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
                    priority={index < 2} // Prioritize loading for first two images
                    quality={85}
                    loading={index < 2 ? 'eager' : 'lazy'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10" />
                  <div className="absolute top-0 left-0 right-0 p-6 z-20 text-white transform transition-transform duration-300 group-hover:translate-y-2">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight drop-shadow-sm">{category.name}</h3>
                    {category.description && (
                      <p className="text-base sm:text-lg font-medium opacity-90 leading-relaxed drop-shadow-sm">{category.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}

          {/* Best Sellers Card */}
          <SwiperSlide>
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
                <div className="absolute top-0 left-0 right-0 p-6 z-20 text-white transform transition-transform duration-300 group-hover:translate-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight drop-shadow-sm">Shop Our Bestsellers</h3>
                  <p className="text-base sm:text-lg font-medium opacity-90 leading-relaxed mb-4 drop-shadow-sm">
                    Discover our most popular products
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigation('/category/best-sellers');
                    }}
                    className="inline-block px-6 py-3 bg-[#FFC300] text-[#333333] rounded-full text-sm font-semibold tracking-wide shadow-lg hover:bg-[#F0B300] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2"
                  >
                    View Collection
                  </button>
                </div>
              </div>
            </Link>
          </SwiperSlide>

          {/* Latest Arrivals Card */}
          <SwiperSlide>
            <Link href="/products?filter=latest" className="block group h-full">
              <div className="relative aspect-[4/5] w-full overflow-hidden shadow-lg">
                {featuredImages.latest ? (
                  <Image
                    src={getImageUrl(featuredImages.latest)}
                    alt="Latest Arrivals"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={true}
                    quality={85}
                    loading="eager"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C5A467] to-[#E6C78E] flex items-center justify-center">
                    <span className="text-white text-lg font-medium">Latest Arrivals</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10" />
                <div className="absolute top-0 left-0 right-0 p-6 z-20 text-white transform transition-transform duration-300 group-hover:translate-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight drop-shadow-sm">Explore Latest Arrivals</h3>
                  <p className="text-base sm:text-lg font-medium opacity-90 leading-relaxed mb-4 drop-shadow-sm">
                    Check out our newest additions
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavigation('/category/latest-arrivals');
                    }}
                    className="inline-block px-6 py-3 bg-[#FFC300] text-[#333333] rounded-full text-sm font-semibold tracking-wide shadow-lg hover:bg-[#F0B300] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2"
                  >
                    Shop Now
                  </button>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        </Swiper>
      </div>
      {/* If Swiper navigation buttons are present, style them as perfect circles */}
      <style jsx global>{`
        .category-swiper .swiper-button-prev,
        .category-swiper .swiper-button-next {
          width: 56px !important;
          height: 56px !important;
          border-radius: 9999px !important;
          background: #FFC300 !important;
          color: white !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          opacity: 0.9;
          transition: opacity 0.2s;
        }
        .category-swiper .swiper-button-prev:hover,
        .category-swiper .swiper-button-next:hover {
          opacity: 1;
          background: #FFD54F !important;
        }
      `}</style>
    </section>
  );
} 