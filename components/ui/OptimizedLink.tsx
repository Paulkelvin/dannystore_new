import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedLinkProps extends React.ComponentProps<typeof Link> {
  prefetchOnHover?: boolean;
  prefetchOnMount?: boolean;
  preloadOnHover?: boolean;
  className?: string;
  children: React.ReactNode;
  isCriticalJourney?: boolean;
}

// Critical paths for e-commerce user journey
const CRITICAL_PATHS = {
  // Main navigation
  main: [
    '/products',
    '/category/best-sellers',
    '/category/latest-arrivals',
    '/cart',
  ],
  // Purchase journey
  purchase: [
    '/checkout',
    '/cart',
    '/products?sort=featured',
  ],
  // Category browsing
  categories: [
    '/category/toys',
    '/category/educational-toys',
    '/category/outdoor-toys',
    '/category/best-sellers',
    '/category/latest-arrivals',
  ],
  // User account
  account: [
    '/account',
    '/account/orders',
    '/account/wishlist',
    '/account/settings',
  ],
  // Search and discovery
  discovery: [
    '/search',
    '/products?sort=featured',
    '/products?sort=newest',
    '/products?sort=price-low',
    '/products?sort=price-high',
  ],
};

// Related paths that should be prefetched together
const RELATED_PATHS = {
  '/products': ['/category/best-sellers', '/category/latest-arrivals'],
  '/cart': ['/checkout'],
  '/category/best-sellers': ['/products?sort=featured'],
  '/category/latest-arrivals': ['/products?sort=newest'],
  '/checkout': ['/account/orders'],
};

export default function OptimizedLink({
  href,
  prefetchOnHover = true,
  prefetchOnMount = false,
  preloadOnHover = false,
  className,
  children,
  isCriticalJourney = false,
  ...props
}: OptimizedLinkProps) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const path = typeof href === 'string' ? href : href.pathname || '';

  // Check if this is a critical path
  const isCriticalPath = Object.values(CRITICAL_PATHS).some(paths => 
    paths.includes(path)
  );

  // Get related paths to prefetch
  const getRelatedPaths = useCallback((path: string) => {
    return RELATED_PATHS[path] || [];
  }, []);

  // Prefetch a path and its related paths
  const prefetchPath = useCallback((path: string, priority = false) => {
    // Prefetch the main path
    router.prefetch(path, { priority });
    
    // Prefetch related paths
    getRelatedPaths(path).forEach(relatedPath => {
      router.prefetch(relatedPath, { priority: false });
    });
  }, [router, getRelatedPaths]);

  // Always prefetch critical paths
  useEffect(() => {
    if (isCriticalPath || isCriticalJourney) {
      prefetchPath(path, true);
    }
  }, [path, isCriticalPath, isCriticalJourney, prefetchPath]);

  // Handle prefetch on mount for non-critical paths
  useEffect(() => {
    if (prefetchOnMount && !isCriticalPath && !isCriticalJourney) {
      prefetchPath(path, false);
    }
  }, [path, prefetchOnMount, isCriticalPath, isCriticalJourney, prefetchPath]);

  // Handle hover prefetching
  useEffect(() => {
    if (isHovered && prefetchOnHover && !isCriticalPath && !isCriticalJourney) {
      prefetchPath(path, false);
    }
  }, [isHovered, path, prefetchOnHover, isCriticalPath, isCriticalJourney, prefetchPath]);

  // Handle preloading on hover
  useEffect(() => {
    if (isHovered && preloadOnHover) {
      prefetchPath(path, true);
    }
  }, [isHovered, path, preloadOnHover, prefetchPath]);

  // Prefetch next likely paths based on current path
  useEffect(() => {
    if (currentPath && isCriticalPath) {
      const relatedPaths = getRelatedPaths(currentPath);
      relatedPaths.forEach(relatedPath => {
        router.prefetch(relatedPath, { priority: false });
      });
    }
  }, [currentPath, isCriticalPath, router, getRelatedPaths]);

  return (
    <Link
      href={href}
      className={cn(className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </Link>
  );
} 