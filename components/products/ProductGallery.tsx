'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Product, SanityImageReference } from '@/types';
import { urlFor } from '@/lib/sanityClient';
import { Expand } from 'lucide-react';

interface ProductGalleryProps {
  mainImage: SanityImageReference;
  gallery?: SanityImageReference[];
  productName: string;
}

export default function ProductGallery({ mainImage, gallery = [], productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const mainImgRef = useRef<HTMLDivElement>(null);

  // Combine main image and gallery images, ensuring main image is first and filtering out nulls
  const images = useMemo(() => 
    [mainImage, ...(gallery || [])].filter(
      (img, index, self) => img?.asset?._ref && index === self.findIndex((t) => t?.asset?._ref === img?.asset?._ref)
    ),
    [mainImage, gallery]
  );

  // Safety check for selectedImage
  const selectedImageIndex = Math.min(selectedImage, images.length - 1);
  const currentImage = images[selectedImageIndex];

  if (!currentImage?.asset) {
    return (
      <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        No Image Available
      </div>
    );
  }

  // Generate image URLs with proper type checking
  const builder = urlFor(currentImage);
  if (!builder) {
    return (
      <div className="aspect-square w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Error loading image
      </div>
    );
  }

  const mainImageUrl = builder.width(800).height(1000).url() || '';
  const zoomImageUrl = builder.width(1200).height(1600).url() || '';

  // Memoize event handlers
  const handleMouseEnter = useCallback(() => setIsZoomed(true), []);
  const handleMouseLeave = useCallback(() => setIsZoomed(false), []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImgRef.current) return;
    const rect = mainImgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedImage(index);
  }, []);

  return (
    <div className="flex gap-4 w-full">
      {/* Thumbnails - Left Side */}
      <div className="flex flex-col gap-3 w-20">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`relative aspect-square w-20 overflow-hidden rounded-md ${
              selectedImage === index 
                ? 'ring-2 ring-[#C5A467]' 
                : 'ring-1 ring-gray-200 hover:ring-gray-300'
            }`}
          >
            <Image
              src={(function() {
                const builder = urlFor(image);
                if (builder && typeof builder.width === 'function' && typeof builder.height === 'function') {
                  const url = builder.width(80).height(80).url();
                  return url ?? '';
                }
                return '';
              })()}
              alt={`${productName} - Thumbnail ${index + 1}`}
              width={80}
              height={80}
              className="h-full w-full object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Main Image - Right Side */}
      <div className="flex-1">
        <div
          className="relative aspect-[5/6] sm:aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-100 group"
          ref={mainImgRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
        >
          <Image
            src={mainImageUrl}
            alt={currentImage.alt || productName || 'Product image'}
            width={800}
            height={1000}
            className="h-full w-full object-contain object-center"
            priority
          />
          {/* Zoom Lens */}
          {isZoomed && (
            <div
              className="hidden md:block absolute pointer-events-none z-30 border-2 border-[#42A5F5] rounded-full shadow-lg"
              style={{
                left: `calc(${zoomPos.x}% - 80px)` ,
                top: `calc(${zoomPos.y}% - 80px)` ,
                width: '160px',
                height: '160px',
                overflow: 'hidden',
                background: `url(${zoomImageUrl}) no-repeat`,
                backgroundSize: '800px 1000px',
                backgroundPosition: `${-zoomPos.x * 8 + 80}px ${-zoomPos.y * 10 + 80}px`,
                boxShadow: '0 4px 16px rgba(66,165,245,0.15)'
              }}
            />
          )}
          {/* Expand button */}
          <button 
            className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
            onClick={() => {/* Add expand functionality later */}}
          >
            <Expand className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
} 