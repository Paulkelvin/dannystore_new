'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function DiscoveryHubSection() {
  // (You can replace this with a dynamic image or a static asset if available.)
  const bgImageUrl = '/images/discovery-hub-bg.jpg'; // (Ensure this asset exists or replace with a fallback.)

  return (
    <section className="relative w-full py-24 bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
         <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#333333] mb-2">Discovery Hub</h2>
            <p className="text-lg text-[#6c757d]">Explore our curated toys and fun ideas for your little ones.</p>
         </div>
         {bgImageUrl && (
            <div className="relative w-full h-[300px] mb-8 overflow-hidden rounded-lg shadow-md">
               <Image
                  src={bgImageUrl}
                  alt="Discovery Hub Background"
                  fill
                  style={{ objectFit: 'cover' }}
               />
            </div>
         )}
         <div className="flex justify-center mt-6">
            <Link
               href="/discovery"
               className="inline-block px-6 py-3 bg-[#42A5F5] text-white font-semibold rounded-lg shadow hover:bg-[#1e88e5] transition-colors"
            >
               Explore More
            </Link>
         </div>
      </div>
    </section>
  );
} 