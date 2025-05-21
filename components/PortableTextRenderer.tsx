import { PortableText as BasePortableText } from '@portabletext/react';
import type { PortableTextReactComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

// Define serializers for different types of content in PortableText
const components: Partial<PortableTextReactComponents> = {
  block: ({ children, value }) => {
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
  marks: {
    // Handle links inside the PortableText (e.g., underlined URLs)
    link: ({ children, value }) => {
      const { href } = value;
      return (
        <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
};

interface PortableTextProps {
  value: PortableTextBlock[];
}

export default function PortableText({ value }: PortableTextProps) {
  return <BasePortableText value={value} components={components} />;
}
