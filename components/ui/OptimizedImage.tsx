import { useState, useEffect } from 'react';
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
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  loading = 'lazy',
  onLoad,
  containerClassName,
  showSkeleton = true,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!image?.asset?._ref) {
      console.warn('OptimizedImage: Invalid image source', image);
      setError(true);
      return;
    }

    try {
      const builder = urlFor(image);
      if (!builder) {
        console.warn('OptimizedImage: Failed to generate image URL', image);
        setError(true);
        return;
      }

      const url = builder
        .width(width || 800)
        .height(height || 800)
        .quality(quality)
        .url();

      if (!url) {
        console.warn('OptimizedImage: Failed to generate image URL', image);
        setError(true);
        return;
      }

      setImageUrl(url);
      setError(false);
    } catch (err) {
      console.error('OptimizedImage: Error processing image', err, image);
      setError(true);
    }
  }, [image, width, height, quality]);

  if (error || !imageUrl) {
    return (
      <div className={cn(
        "bg-gray-100 flex items-center justify-center",
        containerClassName || "aspect-square w-full rounded-lg"
      )}>
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", containerClassName)}>
      {showSkeleton && isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-lg" />
      )}
      <Image
        src={imageUrl}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        priority={priority}
        loading={loading}
        quality={quality}
        sizes={sizes}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
        onError={(e) => {
          console.error('OptimizedImage: Failed to load image', e);
          setError(true);
        }}
      />
    </div>
  );
} 