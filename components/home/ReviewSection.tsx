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
  const query = groq`*[_type == "review" && isFeatured == true] {
    _id,
    name,
    avatar,
    rating,
    text
  }`;
  return sanityClientPublic.fetch<Review[]>(query);
}

export default async function ReviewSection() {
  const reviews = await getReviews();
  return <ReviewList reviews={reviews} />;
} 