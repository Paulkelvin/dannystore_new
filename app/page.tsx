// =========================================
// FILE: src/app/page.tsx (Homepage)
// =========================================
import { groq } from 'next-sanity';
import { sanityFetch } from '@/lib/sanity';
import { unstable_cache } from 'next/cache';
import ProductSection from '@/components/products/ProductSection';
import HeroCarousel from '@/components/home/HeroCarousel';
import CategorySection from '@/components/home/CategorySection';
import BestsellersSection from '@/components/home/BestsellersSection';
import NewArrivalsSection from '@/components/home/NewArrivalsSection';
import BrandPillarsSection from '@/components/home/BrandPillarsSection';
import CategoryGridSection from '@/components/categories/CategoryGridSection';
import LifestyleMarquee from '@/components/collections/LifestyleMarquee';
import ReviewSection from '@/components/home/ReviewSection';
import EmailSignupSection from '@/components/home/EmailSignupSection';
import CollectionMarqueeSection from '@/components/home/CollectionMarqueeSection';

// GROQ queries
const categoriesQuery = groq`*[_type == "category"] {
  _id,
  name,
  "slug": slug.current,
  image
}`;

const latestProductsQuery = groq`*[_type == "product"] | order(_createdAt desc)[0...8] {
  _id,
  name,
  price,
  "slug": slug.current,
  mainImage,
  rating,
  reviewCount,
  description,
  keyBenefits,
  specifications,
  variants[] {
    _key,
    color,
    size,
    stock,
    price
  }
}`;

const bestSellersQuery = groq`*[_type == "product"] | order(salesCount desc, rating desc)[0...8] {
  _id,
  name,
  price,
  "slug": slug.current,
  mainImage,
  rating,
  reviewCount,
  salesCount,
  description,
  keyBenefits,
  specifications,
  enableQuickView,
  showAddToCartButton,
  customActions[] {
    label,
    url,
    isPrimary
  },
  variants[] {
    _key,
    color,
    size,
    stock,
    price
  }
}`;

const lifestylePackagesQuery = groq`*[_type == "lifestylePackage" && isActive == true]{
  _id,
  title,
  slug,
  marqueeImage,
  callToActionText
}`;

// Cache functions
const getCachedCategories = unstable_cache(
  async () => {
    return (await sanityFetch({
      query: categoriesQuery,
      tags: ['categories'],
    })) as any[];
  },
  ['categories'],
  { revalidate: 3600 } // Cache for 1 hour
);

const getCachedLatestProducts = unstable_cache(
  async () => {
    return (await sanityFetch({
      query: latestProductsQuery,
      tags: ['latest-products'],
    })) as any[];
  },
  ['latest-products'],
  { revalidate: 3600 }
);

const getCachedBestSellers = unstable_cache(
  async () => {
    return (await sanityFetch({
      query: bestSellersQuery,
      tags: ['best-sellers'],
    })) as any[];
  },
  ['best-sellers'],
  { revalidate: 3600 }
);

const getCachedNewArrivals = unstable_cache(
  async () => {
    return (await sanityFetch({
      query: latestProductsQuery, // Reuse the same query
      tags: ['new-arrivals'],
    })) as any[];
  },
  ['new-arrivals'],
  { revalidate: 3600 }
);

const getCachedLifestylePackages = unstable_cache(
  async () => {
    return (await sanityFetch({
      query: lifestylePackagesQuery,
      tags: ['lifestyle-packages'],
    })) as any[];
  },
  ['lifestyle-packages'],
  { revalidate: 3600 }
);

export default async function HomePage() {
  try {
    console.log('🔄 Starting homepage data fetch...');
    console.log('Environment check:', {
      hasProjectId: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      hasDataset: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
    });
    
    // Fetch all data in parallel
    const [categories, bestSellers, latestProducts, lifestylePackages] = await Promise.all([
      getCachedCategories().catch(error => {
        console.error('❌ Error fetching categories:', error);
        console.error('Categories error details:', {
          message: error.message,
          stack: error.stack,
          query: categoriesQuery
        });
        return [];
      }),
      getCachedBestSellers().catch(error => {
        console.error('❌ Error fetching best sellers:', error);
        console.error('Best sellers error details:', {
          message: error.message,
          stack: error.stack,
          query: bestSellersQuery
        });
        return [];
      }),
      getCachedLatestProducts().catch(error => {
        console.error('❌ Error fetching latest products:', error);
        console.error('Latest products error details:', {
          message: error.message,
          stack: error.stack,
          query: latestProductsQuery
        });
        return [];
      }),
      getCachedLifestylePackages().catch(error => {
        console.error('❌ Error fetching lifestyle packages:', error);
        console.error('Lifestyle packages error details:', {
          message: error.message,
          stack: error.stack,
          query: lifestylePackagesQuery
        });
        return [];
      })
    ]);

    // Log the actual data received
    console.log('📦 Data received:', {
      categories: categories?.slice(0, 2), // Log first 2 items
      bestSellers: bestSellers?.slice(0, 2),
      latestProducts: latestProducts?.slice(0, 2),
      lifestylePackages: lifestylePackages?.slice(0, 2)
    });

    console.log('✅ Data fetched successfully:', {
      categoriesCount: categories?.length || 0,
      bestSellersCount: bestSellers?.length || 0,
      latestProductsCount: latestProducts?.length || 0,
      lifestylePackagesCount: lifestylePackages?.length || 0
    });

    // Validate data before rendering
    if (!Array.isArray(categories) || !Array.isArray(bestSellers) || 
        !Array.isArray(latestProducts) || !Array.isArray(lifestylePackages)) {
      throw new Error('Invalid data received from Sanity');
    }

    return (
      <div className="space-y-12">
        <HeroCarousel />
        <CategorySection categories={categories} />
        <BestsellersSection products={bestSellers} />
        <NewArrivalsSection products={latestProducts} />
        <CategoryGridSection categories={categories} />
        <CollectionMarqueeSection collections={lifestylePackages} />
        <BrandPillarsSection />
        <ReviewSection />
        <EmailSignupSection />
      </div>
    );
  } catch (error) {
    console.error('❌ Error in HomePage:', error);
    console.error('HomePage error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <p className="text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }
}

// Revalidate data every hour
export const revalidate = 3600;
