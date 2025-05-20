'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityClient';
import { SanityImageReference } from '@/types';

interface ProductGalleryProps {
  mainImage: SanityImageReference | null;
  gallery: SanityImageReference[] | null;
  productName: string;
}

export default function ProductGallery({ mainImage, gallery, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<SanityImageReference | null>(mainImage);
  const allImages = mainImage ? [mainImage, ...(gallery || [])] : gallery || [];

  if (!allImages.length) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <div className="flex items-center justify-center h-full text-gray-400">
          No images available
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        {selectedImage && (
          <Image
            src={urlFor(selectedImage).width(800).height(800).url()}
            alt={`${productName} - Main view`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        )}
      </div>

      {/* Thumbnail Gallery */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {allImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === image
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={urlFor(image).width(200).height(200).url()}
                alt={`${productName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 