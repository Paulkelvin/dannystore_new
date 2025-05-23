import { groq } from 'next-sanity';
import { sanityClientPublic } from '@/lib/sanityClient';
import ReviewList from './ReviewList';
import type { SanityImageReference } from '@/types';

interface Review {
  _id: string;
  name: string;
  avatar: SanityImageReference;
  rating: number;
  text: string;
  _createdAt: string;  // Adding this to help with ordering
}

async function getReviews() {
  console.log('🔍 Fetching reviews...');
  const query = groq`*[_type == "review" && isFeatured == true] | order(_createdAt desc) {
    _id,
    name,
    avatar,
    rating,
    text,
    _createdAt
  }[0...10]`;  // Limit to 10 reviews, ordered by creation date
  try {
    const reviews = await sanityClientPublic.fetch<Review[]>(query);
    console.log('📝 Reviews fetched:', {
      count: reviews.length,
      reviews: reviews.map(r => ({
        id: r._id,
        name: r.name,
        rating: r.rating,
        createdAt: r._createdAt
      }))
    });
    return reviews;
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return [];
  }
}

export default async function ReviewSection() {
  console.log('🎬 ReviewSection component rendering...');
  const reviews = await getReviews();
  console.log('✅ Reviews to display:', {
    total: reviews.length,
    ids: reviews.map(r => r._id)
  });
  
  if (!reviews || reviews.length === 0) {
    console.log('⚠️ No reviews found to display');
  } else {
    console.log('📊 Review stats:', {
      total: reviews.length,
      averageRating: reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length,
      featuredCount: reviews.length
    });
  }
  
  return <ReviewList reviews={reviews} />;
} 