'use client';

import { useState, useEffect } from 'react';
import { ProductVariant } from '@/types';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
  basePrice?: number;
}

export default function ProductVariantSelector({
  variants,
  selectedVariant,
  onVariantSelect,
  basePrice,
}: ProductVariantSelectorProps) {
  // Local state for selected color and size
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Only show colors that are present in the denormalized variants and have stock
  const allColors = Array.from(
    new Set(
      variants
        .filter(
          v =>
            typeof v.stock === 'number' && v.stock > 0 &&
            (!selectedSize || !v.size || v.size.name === selectedSize)
        )
        .map(v => v.color?.name)
        .filter(Boolean)
    )
  );

  // Only show sizes that are present in the denormalized variants and have stock
  const allSizes = Array.from(
    new Set(
      variants
        .filter(
          v =>
            typeof v.stock === 'number' && v.stock > 0 &&
            (!selectedColor || !v.color || v.color.name === selectedColor)
        )
        .map(v => v.size?.name)
        .filter(Boolean)
    )
  );

  // Set initial color/size if not set
  useEffect(() => {
    if (!selectedColor && allColors.length > 0 && typeof allColors[0] === 'string') {
      setSelectedColor(allColors[0]);
    }
    if (!selectedSize && allSizes.length > 0 && typeof allSizes[0] === 'string') {
      setSelectedSize(allSizes[0]);
    }
    // eslint-disable-next-line
  }, [variants.length, allColors.length, allSizes.length]);

  // Update selected variant when color or size changes
  useEffect(() => {
    // If no variants have colors or sizes, select the first variant
    if (!allColors.length && !allSizes.length && variants.length > 0) {
      onVariantSelect(variants[0]);
      return;
    }

    // If we have a color and size selection
    if (selectedColor && selectedSize) {
      const variant = variants.find(
        v => v.color?.name === selectedColor && v.size?.name === selectedSize
      );
      if (variant) {
        onVariantSelect(variant);
      }
    }
    // If we only have a color selection
    else if (selectedColor && !allSizes.length) {
      const variant = variants.find(v => v.color?.name === selectedColor);
      if (variant) {
        onVariantSelect(variant);
      }
    }
    // If we only have a size selection
    else if (selectedSize && !allColors.length) {
      const variant = variants.find(v => v.size?.name === selectedSize);
      if (variant) {
        onVariantSelect(variant);
      }
    }
  }, [selectedColor, selectedSize, variants, onVariantSelect, allColors.length, allSizes.length]);

  // Handle color selection
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Find first available size for the selected color
    const firstAvailableSize = variants
      .filter(v => v.color?.name === color && typeof v.stock === 'number' && v.stock > 0)
      .sort((a, b) => (a.size?.name || '').localeCompare(b.size?.name || ''))[0]?.size?.name;
    
    if (firstAvailableSize) {
      setSelectedSize(firstAvailableSize);
    } else {
      setSelectedSize(null);
    }
  };

  // Handle size selection
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    // Find first available color for the selected size
    const firstAvailableColor = variants
      .filter(v => v.size?.name === size && typeof v.stock === 'number' && v.stock > 0)
      .sort((a, b) => (a.color?.name || '').localeCompare(b.color?.name || ''))[0]?.color?.name;
    
    if (firstAvailableColor) {
      setSelectedColor(firstAvailableColor);
    } else {
      setSelectedColor(null);
    }
  };

  // Get available sizes for a specific color
  const getAvailableSizesForColor = (color: string) => {
    return variants
      .filter(v => v.color?.name === color && typeof v.stock === 'number' && v.stock > 0)
      .map(v => v.size?.name)
      .filter(Boolean);
  };

  // Get available colors for a specific size
  const getAvailableColorsForSize = (size: string) => {
    return variants
      .filter(v => v.size?.name === size && typeof v.stock === 'number' && v.stock > 0)
      .map(v => v.color?.name)
      .filter(Boolean);
  };

  // Check if a combination is available
  const isCombinationAvailable = (color: string, size: string) => {
    return variants.some(v => v.color?.name === color && v.size?.name === size && typeof v.stock === 'number' && v.stock > 0);
  };

  // If no variants have colors or sizes, don't show any selectors
  if (!allColors.length && !allSizes.length) {
    return null;
  }

  return (
    <div className="mt-2 space-y-8">
      {/* Color selector */}
      {allColors.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-900">Color</h2>
          <div className="mt-4 flex items-center space-x-3">
            {allColors.map((colorName) => (
              <button
                key={colorName}
                onClick={() => handleColorChange(colorName || '')}
                className={`relative h-8 w-8 rounded-full border ${selectedColor === colorName ? 'ring-2 ring-indigo-600 ring-offset-2' : 'ring-1 ring-gray-200'}`}
                style={{ backgroundColor: variants.find(v => v.color?.name === colorName)?.color?.value || '#ccc' }}
                aria-label={colorName}
              >
                <span className="sr-only">{colorName}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Size selector */}
      {allSizes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-900">Size</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {allSizes.map((sizeName) => (
              <button
                key={sizeName}
                onClick={() => handleSizeChange(sizeName || '')}
                className={`flex items-center justify-center border py-3 px-6 text-sm font-medium uppercase ${selectedSize === sizeName ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'} rounded-none`}
              >
                {sizeName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 