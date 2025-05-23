'use client';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { urlFor } from '@/lib/sanityClient';
import type { SanityImageReference } from '@/types';

interface Review {
  _id: string;
  name: string;
  avatar: SanityImageReference;
  rating: number;
  text: string;
}

function AvatarWithSkeleton({ avatar, name }: { avatar: SanityImageReference; name: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('🖼️ Avatar component mounted for:', name);
  }, [name]);

  const handleImageError = () => {
    console.error('❌ Error loading avatar for:', name);
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className="relative w-12 h-12 rounded-full overflow-hidden">
      {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      {!hasError ? (
        <Image
          src={urlFor(avatar)?.width(96).height(96).url() ?? '/images/placeholder.png'}
          alt={`${name}'s avatar`}
          fill
          className={`object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => {
            console.log('✅ Avatar loaded for:', name);
            setIsLoading(false);
          }}
          onError={handleImageError}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#C5A467] to-[#E6C78E] flex items-center justify-center">
          <span className="text-white text-lg font-medium">{name.charAt(0)}</span>
        </div>
      )}
    </div>
  );
}

export default function ReviewList({ reviews, isHomePage = false }: { reviews: Review[], isHomePage?: boolean }) {
  useEffect(() => {
    console.log('📋 ReviewList received reviews:', reviews);
  }, [reviews]);

  if (!reviews || reviews.length === 0) {
    console.log('⚠️ ReviewList: No reviews to display');
    return (
      <section className="w-full py-24 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#333333] mb-2">Customer Reviews</h2>
          <p className="text-lg text-[#6c757d] mb-10">Be the first to leave a review!</p>
          <div className="bg-white rounded-2xl border border-[#DEE2E6] p-8">
            <p className="text-[#4A4A4A]">No reviews yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-24 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#333333]">Hear From Our Happy Customers</h2>
          <p className="hidden sm:block text-lg text-[#6c757d] mt-2">Real stories from parents and kids who love our toys!</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="rounded-2xl bg-white border border-[#DEE2E6] p-8 flex flex-col items-start relative hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <AvatarWithSkeleton avatar={review.avatar} name={review.name} />
                <div className="ml-4">
                  <div className="text-lg font-semibold text-[#333333]">{review.name}</div>
                </div>
              </div>
              <p className="text-[#4A4A4A] mb-6 text-base leading-relaxed">"{review.text}"</p>
              <div className="flex items-center mt-auto">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#FFC300] fill-[#FFC300] mr-1" />
                ))}
                {[...Array(5 - review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#DEE2E6] mr-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
        {isHomePage && (
          <div className="text-center mt-12">
            <a
              href="/reviews"
              className="inline-block px-8 py-3 bg-[#FFC300] text-[#333333] font-semibold rounded-full shadow-lg hover:bg-[#F0B300] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2"
            >
              Read more reviews
            </a>
          </div>
        )}
      </div>
    </section>
  );
} 