'use client';

import { useState } from 'react';
import { ProductVariant } from '@/types';
import ProductVariantSelector from './ProductVariantSelector';

interface ProductVariantWrapperProps {
  variants: ProductVariant[];
  basePrice?: number;
}

export default function ProductVariantWrapper({
  variants,
  basePrice,
}: ProductVariantWrapperProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  return (
    <ProductVariantSelector
      variants={variants}
      basePrice={basePrice}
      selectedVariant={selectedVariant}
      onVariantSelect={setSelectedVariant}
    />
  );
} 