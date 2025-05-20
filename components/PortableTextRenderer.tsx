import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@/types';

// Define serializers for different types of content in PortableText
const serializers = {
  types: {
    // Handle paragraphs
    block: ({ children, style }: { children: React.ReactNode; style: string }) => {
      if (style === 'h1') {
        return <h1 className="text-3xl font-bold">{children}</h1>;
      }
      if (style === 'h2') {
        return <h2 className="text-2xl font-semibold">{children}</h2>;
      }
      return <p className="text-lg">{children}</p>;
    },
  },
  marks: {
    // Handle links inside the PortableText (e.g., underlined URLs)
    link: ({ children, value }: { children: React.ReactNode; value: { href: string } }) => {
      return (
        <a href={value.href} className="text-blue-500 hover:underline">
          {children}
        </a>
      );
    },
  },
};

interface Props {
  value: PortableTextBlock[] | undefined;
}

export default function PortableTextRenderer({ value }: Props) {
  if (!value) return null;

  return (
    <div className="prose prose-sm sm:prose-base max-w-none">
      {/* Render PortableText with the defined serializers */}
      <PortableText value={value} components={serializers} />
    </div>
  );
}
