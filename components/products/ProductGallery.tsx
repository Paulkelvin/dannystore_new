'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { urlFor } from '@/lib/sanityClient';
import { Expand } from 'lucide-react';

interface ProductGalleryProps {
  mainImage: any; // (or SanityImageReference if you have a type for it)
  gallery: any[] | null; // (or SanityImageReference[] if you have a type for it)
  productName: string;
}

export default function ProductGallery({ mainImage, gallery, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const mainImgRef = useRef<HTMLDivElement>(null);

  // Memoize images array to prevent unnecessary re-renders
  const images = useMemo(() => [mainImage, ...(gallery || [])], [mainImage, gallery]);

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
              src={urlFor(image).width(80).height(80).url()}
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
            src={urlFor(images[selectedImage]).width(800).height(1000).url()}
            alt={productName}
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
                background: `url(${urlFor(images[selectedImage]).width(1200).height(1600).url()}) no-repeat`,
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