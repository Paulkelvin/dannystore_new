import Marquee from 'react-fast-marquee';
import Link from 'next/link';
import { urlFor } from '@/lib/sanityClient';

interface LifestylePackage {
  _id: string;
  title: string;
  slug: { current: string };
  marqueeImage?: any;
  callToActionText?: string;
}

interface Props {
  lifestylePackages: LifestylePackage[];
}

export default function LifestyleMarquee({ lifestylePackages }: Props) {
  if (!lifestylePackages || lifestylePackages.length === 0) return null;

  return (
    <section className="w-full py-12 bg-[#F6F6F6]">
      <h2 className="text-2xl font-bold mb-2 text-center">Lifestyle Packages</h2>
      <p className="text-lg text-[#6c757d] text-center mb-8">What's Their Play Vibe? Cool Collections are Rolling Your Way</p>
      <Marquee gradient={false} speed={40} pauseOnHover className="w-full">
        <div className="flex gap-x-2 items-stretch w-full">
          {lifestylePackages.map((pkg) => (
            <Link
              key={pkg._id}
              href={`/packages/${pkg.slug.current}`}
              className="block flex-1 min-w-0"
              style={{ flexBasis: 0 }}
            >
              <div
                className="relative rounded-xl shadow-lg overflow-hidden group h-full bg-white flex flex-col"
                style={{
                  transform: 'skewX(-15deg)',
                  background: '#F6F6F6',
                  transition: 'transform 0.3s, opacity 0.3s',
                }}
              >
                {pkg.marqueeImage ? (
                  <img
                    src={urlFor(pkg.marqueeImage)?.width(600).height(400).url() ?? '/images/placeholder.png'}
                    alt={pkg.title}
                    className="w-full h-80 object-cover"
                    style={{ transform: 'skewX(15deg)' }}
                  />
                ) : (
                  <div
                    className="w-full h-80 flex items-end justify-center"
                    style={{
                      background: '#E0E7FF',
                      transform: 'skewX(15deg)',
                    }}
                  >
                    <span className="text-lg font-bold text-gray-700 mb-4">{pkg.title}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 w-full bg-black/50 py-3 px-4">
                  <span className="text-white font-semibold text-lg">{pkg.title}</span>
                  {pkg.callToActionText && (
                    <span className="block text-white text-sm mt-1">{pkg.callToActionText}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Marquee>
    </section>
  );
} 