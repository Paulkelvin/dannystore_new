'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroImage } from '@/types';
import { useState, useEffect, useRef } from 'react';

const heroImages: HeroImage[] = [
  {
    src: '/images/hero.png',
    alt: 'Hero Image 1',
    cta: 'Shop Featured Products',
    ctaUrl: '/products?sort=featured',
  },
  {
    src: '/images/hero2.png',
    alt: 'Hero Image 2',
    cta: 'Learn About Us',
    ctaUrl: '/about',
  },
  {
    src: '/images/hero3.png',
    alt: 'Hero Image 3',
    cta: 'Get in Touch',
    ctaUrl: '/contact',
  },
  {
    src: '/images/hero4.png',
    alt: 'Hero Image 4',
    cta: 'Shop New Arrivals',
    ctaUrl: '/products?sort=newest',
  }
];

function SkeletonBox({ className = '' }) {
  return <div className={`bg-gray-200 animate-pulse ${className}`} />;
}

interface HeroImageWithSkeletonProps {
  src: string;
  alt: string;
  priority?: boolean;
}

function HeroImageWithSkeleton({ src, alt, priority = false }: HeroImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <div className="relative w-full h-full">
      {isLoading && <SkeletonBox className="absolute inset-0 w-full h-full" />}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        sizes="100vw"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayInterval = useRef<NodeJS.Timeout>();
  const carouselRef = useRef<HTMLElement>(null);

  // Auto-advance the carousel
  useEffect(() => {
    if (!isHovered) {
      autoplayInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (autoplayInterval.current) {
        clearInterval(autoplayInterval.current);
      }
    };
  }, [isHovered]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % heroImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center bg-[#FFC300]"
      role="region"
      aria-label="Hero carousel"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={carouselRef}
    >
      {/* Background Images with Gradient Overlay */}
      <div 
        className="absolute inset-0 w-full h-full"
        role="presentation"
      >
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            role="img"
            aria-label={image.alt}
            aria-hidden={index !== currentIndex}
          >
            <HeroImageWithSkeleton 
              src={image.src} 
              alt={image.alt} 
              priority={index === 0 || index === 1}
            />
            <div 
              className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" 
              aria-hidden="true" 
            />
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center w-full px-4 text-center mt-16"
        role="group"
        aria-label={`Slide ${currentIndex + 1} of ${heroImages.length}`}
      >
        <h1
          className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-4 sm:mb-8 text-white"
          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}
        >
          DISCOVER YOUR NEXT FAVORITE TOYS
        </h1>
        <Link
          href={heroImages[currentIndex].ctaUrl}
          className="bg-white/90 text-[#333333] text-sm sm:text-base font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-full shadow-sm transition-all duration-200 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 hover:scale-105"
          aria-label={`${heroImages[currentIndex].cta} - ${heroImages[currentIndex].alt}`}
        >
          {heroImages[currentIndex].cta}
        </Link>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFC300] hover:bg-[#F0B300] transition-all duration-200 shadow-md border-none outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 pointer-events-auto"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6 text-white" aria-hidden="true" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % heroImages.length)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#FFC300] hover:bg-[#F0B300] transition-all duration-200 shadow-md border-none outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2 pointer-events-auto"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6 text-white" aria-hidden="true" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3"
        role="tablist"
        aria-label="Slide navigation"
      >
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 border-none outline-none
              ${index === currentIndex ? 'bg-[#FFC300] scale-110 shadow' : 'bg-white/50 hover:bg-[#FFC300]'}
              focus:outline-none focus:ring-2 focus:ring-[#FFC300] focus:ring-offset-2
            `}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Go to slide ${index + 1}`}
            tabIndex={0}
          />
        ))}
      </div>
    </section>
  );
} 