import Link from 'next/link';
import { urlFor } from '@/lib/sanityClient';

interface Category {
  _id: string;
  name?: string;
  title?: string;
  slug: string;
  image: any;
}

interface Props {
  categories: Category[];
}

export default function CategoryGridSection({ categories }: Props) {
  if (!categories || categories.length === 0) return null;

  // Use the first category as the featured (large) card
  const [featured, ...rest] = categories;

  return (
    <section id="categories" className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
          <h2 className="text-2xl font-bold text-[#333333]">Explore Our Categories</h2>
        </div>
        <p className="text-lg text-[#6c757d] mb-8 text-left">Find the perfect toy for every age, interest, and adventure.</p>
        {/* Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[220px] lg:auto-rows-[260px]">
          {/* Featured card (large) */}
          {featured && (
            <Link
              href={`/category/${featured.slug}`}
              className="relative rounded-2xl shadow-md overflow-hidden group col-span-1 min-h-[220px] sm:col-span-2 sm:row-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-[540px] flex"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundImage: (() => {
                    let url = '/images/placeholder.png';
                    if (featured.image) {
                      const builder = urlFor(featured.image);
                      if (builder && typeof builder.width === 'function' && typeof builder.height === 'function') {
                        const builtUrl = builder.width(800).height(800).url();
                        if (builtUrl) url = builtUrl;
                      }
                    }
                    return `url('${url}')`;
                  })(),
                }}
              />
              {/* Gradient scrim for text readability */}
              <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%)'}} />
              <div className="relative z-10 flex flex-col justify-end h-full p-8">
                <span className="text-2xl lg:text-3xl font-bold text-white mb-2 drop-shadow">{featured.name || featured.title || 'Category'}</span>
                <span className="inline-flex items-center font-semibold text-[#42A5F5] cursor-pointer transition-colors">
                  <span className="px-4 py-1 rounded-[6px] bg-white group-hover:bg-[#F8F9FA] transition-all duration-200">
                    <span className="font-semibold text-[#42A5F5] group-hover:text-[#63b3fa] hover:underline">Shop now</span>
                    <span className="ml-1 font-semibold text-[#42A5F5] group-hover:text-[#63b3fa]">&gt;</span>
                  </span>
                </span>
              </div>
            </Link>
          )}
          {/* Rest of the categories */}
          {rest.map((cat) => (
            <Link
              key={cat._id}
              href={`/category/${cat.slug}`}
              className="relative rounded-2xl shadow-md overflow-hidden group flex min-h-[220px]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  backgroundImage: (() => {
                    let url = '/images/placeholder.png';
                    if (cat.image) {
                      const builder = urlFor(cat.image);
                      if (builder && typeof builder.width === 'function' && typeof builder.height === 'function') {
                        const builtUrl = builder.width(600).height(600).url();
                        if (builtUrl) url = builtUrl;
                      }
                    }
                    return `url('${url}')`;
                  })(),
                }}
              />
              {/* Gradient scrim for text readability */}
              <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0) 100%)'}} />
              <div className="relative z-10 flex flex-col justify-end h-full p-6">
                <span className="text-lg font-bold text-white mb-1 drop-shadow">{cat.name || cat.title || 'Category'}</span>
                <span className="inline-flex items-center font-semibold text-[#42A5F5] cursor-pointer transition-colors">
                  <span className="px-4 py-1 rounded-[6px] bg-white group-hover:bg-[#F8F9FA] transition-all duration-200">
                    <span className="font-semibold text-[#42A5F5] group-hover:text-[#63b3fa] hover:underline">Shop now</span>
                    <span className="ml-1 font-semibold text-[#42A5F5] group-hover:text-[#63b3fa]">&gt;</span>
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 