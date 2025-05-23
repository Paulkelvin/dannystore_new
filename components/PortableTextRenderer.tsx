import { PortableText as BasePortableText } from '@portabletext/react';
import type { PortableTextReactComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import Image from 'next/image';
import { urlFor } from '@/lib/sanityClient';
import { ErrorBoundary } from 'react-error-boundary';

interface SanityImageReference {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

// Define serializers for different types of content in PortableText
const components: Partial<PortableTextReactComponents> = {
  block: ({ children, value }) => {
    if (!value || typeof value !== 'object') {
      console.error('Invalid block value:', value);
      return null;
    }

    const style = value.style || 'normal';
    switch (style) {
      case 'h1':
        return <h1 className="text-4xl font-bold mb-4">{children}</h1>;
      case 'h2':
        return <h2 className="text-3xl font-bold mb-3">{children}</h2>;
      case 'h3':
        return <h3 className="text-2xl font-bold mb-2">{children}</h3>;
      case 'h4':
        return <h4 className="text-xl font-bold mb-2">{children}</h4>;
      case 'blockquote':
        return <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>;
      default:
        return <p className="mb-4">{children}</p>;
    }
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">{children}</code>,
    underline: ({ children }) => <span className="underline">{children}</span>,
    'strike-through': ({ children }) => <span className="line-through">{children}</span>,
    link: ({ children, value }) => {
      if (!value || typeof value !== 'object' || !('href' in value)) {
        console.error('Invalid link value:', value);
        return <>{children}</>;
      }
      const { href } = value;
      return (
        <a 
          href={href} 
          className="text-blue-600 hover:underline" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value || typeof value !== 'object' || !('asset' in value)) {
        console.error('Invalid image value:', value);
        return null;
      }

      const imageUrl = urlFor(value as SanityImageReference)?.url();
      if (!imageUrl) {
        console.error('Could not generate image URL:', value);
        return null;
      }

      return (
        <figure className="my-8">
          <div className="relative w-full h-[400px]">
            <Image
              src={imageUrl}
              alt={value.alt || 'Blog post image'}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </div>
          {value.alt && (
            <figcaption className="text-center text-sm text-gray-500 mt-2">{value.alt}</figcaption>
          )}
        </figure>
      );
    },
  },
};

interface PortableTextProps {
  value: PortableTextBlock[] | null | undefined;
  className?: string;
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600">Error rendering content: {error.message}</p>
    </div>
  );
}

export default function PortableText({ value, className = '' }: PortableTextProps) {
  if (!value) {
    console.warn('PortableText: No value provided');
    return null;
  }

  if (!Array.isArray(value)) {
    console.error('PortableText: Value must be an array of blocks');
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className={className}>
        <BasePortableText value={value} components={components} />
      </div>
    </ErrorBoundary>
  );
}
