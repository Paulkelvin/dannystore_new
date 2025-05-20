'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Collection {
  _id: string;
  title: string;
  slug: string;
  marqueeImage: {
    asset: {
      _ref: string;
    };
  };
  callToActionText: string;
}

export default function CollectionMarqueeSection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections');
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </section>
    );
  }

  if (!collections.length) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden">
          <div className="flex space-x-4 animate-marquee">
            {collections.map((collection) => (
              <div
                key={collection._id}
                className="flex-none w-64 relative group"
              >
                <Link href={`/collections/${collection.slug}`}>
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={`/api/image?asset=${collection.marqueeImage.asset._ref}`}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-xl font-semibold mb-2">
                          {collection.title}
                        </h3>
                        <p className="text-sm">
                          {collection.callToActionText}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 