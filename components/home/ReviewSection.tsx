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
}

async function getReviews() {
  console.log('🔍 Fetching reviews...');
  const query = groq`*[_type == "review" && isFeatured == true] {
    _id,
    name,
    avatar,
    rating,
    text
  }`;
  try {
    const reviews = await sanityClientPublic.fetch<Review[]>(query);
    console.log('📝 Reviews fetched:', reviews);
    return reviews;
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return [];
  }
}

export default async function ReviewSection() {
  console.log('🎬 ReviewSection component rendering...');
  const reviews = await getReviews();
  console.log('✅ Reviews to display:', reviews);
  
  if (!reviews || reviews.length === 0) {
    console.log('⚠️ No reviews found to display');
  }
  
  return <ReviewList reviews={reviews} />;
} 