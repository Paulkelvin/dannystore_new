'use client';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
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
  const avatarUrl = urlFor(avatar)?.width(48).height(48).url() ?? '/images/placeholder.png';
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=232326&color=fff&size=128`;

  return (
    <div className="relative w-12 h-12">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 rounded-full animate-pulse" />
      )}
      <Image
        src={avatarUrl}
        alt={avatar.alt || name}
        width={48}
        height={48}
        className={`rounded-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={(e) => { 
          (e.target as HTMLImageElement).src = fallbackUrl;
        }}
      />
    </div>
  );
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="w-full py-24 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-[#333333] text-center mb-2">Hear From Our Happy Customers</h2>
        <p className="text-lg text-[#6c757d] text-center mb-10">Real stories from parents and kids who love our toys!</p>
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
        <div className="flex justify-center mt-10">
          <a
            href="/reviews"
            className="inline-block px-6 py-3 bg-[#42A5F5] text-white font-semibold rounded-lg shadow hover:bg-[#1e88e5] transition-colors"
          >
            Read more reviews
          </a>
        </div>
      </div>
    </section>
  );
} 