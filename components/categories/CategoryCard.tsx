import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  image: string;
  slug: string;
}

export default function CategoryCard({ name, image, slug }: CategoryCardProps) {
  return (
    <Link href={`/category/${slug}`} className="block group rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden transform hover:scale-105">
      <div className="aspect-square w-full overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4 text-center">
        <span className="text-lg font-semibold text-gray-900">{name}</span>
      </div>
    </Link>
  );
} 