// =========================================
// FILE: src/components/products/ProductImageGallery.tsx (New File)
// =========================================
"use client"; // This component needs client-side state for interaction

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityClient';
import type { SanityImageReference } from '@/types';
import { cn } from '@/lib/utils'; // Utility for combining class names

interface ProductImageGalleryProps {
  mainImage: SanityImageReference;
  gallery?: SanityImageReference[];
  productName: string; // For alt text fallbacks
}

function SkeletonBox({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} style={style} />;
}

export default function ProductImageGallery({ mainImage, gallery = [], productName }: ProductImageGalleryProps) {
  // Combine main image and gallery images, ensuring main image is first
  const allImages = [mainImage, ...(gallery || [])].filter(
    (img, index, self) => img?.asset?._ref && index === self.findIndex((t) => t?.asset?._ref === img?.asset?._ref)
  ); // Filter out potential nulls/duplicates

  const [selectedImage, setSelectedImage] = useState<SanityImageReference>(mainImage);
  const [isLoading, setIsLoading] = useState(true);

  // Update selected image if mainImage prop changes externally
  useEffect(() => {
    setSelectedImage(mainImage);
  }, [mainImage]);

  if (!mainImage?.asset) {
    // Handle case where there's no main image at all
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        No Image Available
      </div>
    );
  }

  const mainImageUrl = urlFor(selectedImage)?.width(800).height(800).quality(85).url() ?? '/images/placeholder.png';

  const blurUrl = urlFor(selectedImage)?.width(20).height(20).quality(30).url() ?? '/images/placeholder.png';

  return (
    <div className="flex flex-col gap-4">
      {/* Main Displayed Image */}
      <div className="aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted relative">
        {isLoading && <SkeletonBox className="absolute inset-0 w-full h-full rounded-lg" />}
        <Image
          src={mainImageUrl}
          alt={selectedImage.alt || productName || 'Product image'}
          width={800}
          height={800}
          priority={true}
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={blurUrl}
          onLoad={() => setIsLoading(false)}
          className={cn(
            "object-contain w-full h-full transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {allImages.map((image, index) => {
            if (!image?.asset) return null;
            const thumbUrl = urlFor(image)?.width(100).height(100).quality(75).url() ?? '/images/placeholder.png';

            return (
              <button
                key={image.asset._ref || index}
                onClick={() => setSelectedImage(image)}
                className={cn(
                  "aspect-square rounded-md overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  selectedImage.asset._ref === image.asset._ref
                    ? "border-primary"
                    : "border-transparent hover:border-muted-foreground"
                )}
                aria-label={`View image ${index + 1}`}
              >
                <SkeletonBox className="absolute inset-0 w-full h-full rounded-md" style={{ display: isLoading ? 'block' : 'none' }} />
                <Image
                  src={thumbUrl}
                  alt={image.alt || `${productName} thumbnail ${index + 1}`}
                  width={100}
                  height={100}
                  loading="lazy"
                  sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 16vw"
                  className="object-cover w-full h-full"
                  onLoad={() => setIsLoading(false)}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}