import Marquee from 'react-fast-marquee';
import Link from 'next/link';
import { urlFor } from '@/lib/sanityClient';

interface Collection {
  _id: string;
  title: string;
  slug: { current: string };
  marqueeImage?: any;
}

interface Props {
  collections: Collection[];
}

export default function CollectionMarqueeSection({ collections }: Props) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="w-full py-12 bg-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Featured Collections</h2>
      <Marquee gradient={false} speed={40} pauseOnHover className="w-full">
        {collections.map((col) => (
          <Link
            key={col._id}
            href={`/collections/${col.slug.current}`}
            className="mx-6 block"
            style={{ minWidth: 260, maxWidth: 320, display: 'inline-block' }}
          >
            <div
              className="relative rounded-xl shadow-lg overflow-hidden group"
              style={{
                transform: 'skewX(-15deg)',
                background: '#F6F6F6',
                transition: 'transform 0.3s, opacity 0.3s',
              }}
            >
              {col.marqueeImage ? (
                <img
                  src={urlFor(col.marqueeImage).width(400).height(300).url()}
                  alt={col.title}
                  className="w-full h-48 object-cover"
                  style={{ transform: 'skewX(15deg)' }}
                />
              ) : (
                <div
                  className="w-full h-48 flex items-end justify-center"
                  style={{
                    background: '#E0E7FF',
                    transform: 'skewX(15deg)',
                  }}
                >
                  <span className="text-lg font-bold text-gray-700 mb-4">{col.title}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 w-full bg-black/50 py-3 px-4">
                <span className="text-white font-semibold text-lg">{col.title}</span>
              </div>
            </div>
          </Link>
        ))}
      </Marquee>
    </section>
  );
} 