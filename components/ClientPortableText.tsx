'use client';

import PortableTextRenderer from './PortableTextRenderer';
import type { PortableTextBlock } from '@portabletext/types';

interface ClientPortableTextProps {
  value: PortableTextBlock[] | null | undefined;
  className?: string;
}

export default function ClientPortableText({ value, className }: ClientPortableTextProps) {
  return <PortableTextRenderer value={value} className={className} />;
} 