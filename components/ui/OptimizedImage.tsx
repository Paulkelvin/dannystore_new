import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityClient';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  image: any; // Sanity image reference
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  containerClassName?: string;
  showSkeleton?: boolean;
}

export default function OptimizedImage({
  image,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  loading = 'lazy',
  onLoad,
  containerClassName = '',
  showSkeleton = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!image?.asset?._ref) {
    return (
      <div className={cn('bg-gray-100 flex items-center justify-center', containerClassName)}>
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  // Generate blur placeholder
  const blurUrl = urlFor(image)
    .width(20)
    .height(20)
    .quality(30)
    .url();

  // Generate main image URL
  const imageUrl = urlFor(image)
    .width(width || 800)
    .height(height || 800)
    .quality(quality)
    .url();

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <div className={cn('relative', containerClassName)}>
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={imageUrl}
        alt={alt}
        {...(fill
          ? { fill: true }
          : {
              width: width || 800,
              height: height || 800,
            })}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        priority={priority}
        loading={loading}
        sizes={sizes}
        placeholder="blur"
        blurDataURL={blurUrl}
        onLoad={handleLoad}
      />
    </div>
  );
} 