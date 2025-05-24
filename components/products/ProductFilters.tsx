import React, { useState, useMemo } from 'react';

export interface ProductFiltersProps {
  categories: { _id: string; name: string }[];
  colors: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
  onChange: (filters: ProductFilterState) => void;
  filterState: ProductFilterState;
  showCategory?: boolean;
  products?: any[]; // Add products prop to check variant availability
}

export interface ProductFilterState {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  inStock?: boolean;
  color?: string;
  size?: string;
  sort?: string;
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
];

export default function ProductFilters({
  categories,
  colors,
  sizes,
  minPrice,
  maxPrice,
  onChange,
  filterState,
  showCategory = false,
  products = [],
}: ProductFiltersProps) {
  const [priceMin, setPriceMin] = useState(filterState.priceMin ?? minPrice);
  const [priceMax, setPriceMax] = useState(filterState.priceMax ?? maxPrice);

  // Compute available colors and sizes based on products
  const availableColors = useMemo(() => {
    if (!products.length) return colors;
    const colorSet = new Set<string>();
    products.forEach(product => {
      if (product.variants) {
        product.variants.forEach((variant: any) => {
          if (variant.color && variant.stock > 0) {
            colorSet.add(variant.color);
          }
        });
      }
    });
    return Array.from(colorSet);
  }, [products, colors]);

  const availableSizes = useMemo(() => {
    if (!products.length) return sizes;
    const sizeSet = new Set<string>();
    products.forEach(product => {
      if (product.variants) {
        product.variants.forEach((variant: any) => {
          if (variant.size && variant.stock > 0) {
            sizeSet.add(variant.size);
          }
        });
      }
    });
    return Array.from(sizeSet);
  }, [products, sizes]);

  // Handlers
  const handleChange = (key: keyof ProductFilterState, value: any) => {
    onChange({ ...filterState, [key]: value });
  };

  return (
    <div className="space-y-6">
      {showCategory && (
        <div>
          <label className="block text-sm font-semibold mb-2">Category</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={filterState.category || 'all-categories'}
            onChange={e => handleChange('category', e.target.value === 'all-categories' ? '' : e.target.value)}
          >
            <option key="category-select-all" value="all-categories">All</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold mb-2">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={minPrice}
            max={priceMax}
            value={priceMin}
            onChange={e => {
              setPriceMin(Number(e.target.value));
              handleChange('priceMin', Number(e.target.value));
            }}
            className="w-20 border rounded px-2 py-1"
            placeholder="Min"
          />
          <span>-</span>
          <input
            type="number"
            min={priceMin}
            max={maxPrice}
            value={priceMax}
            onChange={e => {
              setPriceMax(Number(e.target.value));
              handleChange('priceMax', Number(e.target.value));
            }}
            className="w-20 border rounded px-2 py-1"
            placeholder="Max"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Availability</label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!filterState.inStock}
            onChange={e => handleChange('inStock', e.target.checked)}
            id="inStock"
          />
          <label htmlFor="inStock" className="text-sm">In Stock Only</label>
        </div>
      </div>
      {availableColors.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-2">Color</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={filterState.color || 'all-colors'}
            onChange={e => handleChange('color', e.target.value === 'all-colors' ? '' : e.target.value)}
          >
            <option key="color-select-all" value="all-colors">All</option>
            {availableColors.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>
      )}
      {availableSizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-2">Size</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={filterState.size || 'all-sizes'}
            onChange={e => handleChange('size', e.target.value === 'all-sizes' ? '' : e.target.value)}
          >
            <option key="size-select-all" value="all-sizes">All</option>
            {availableSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-semibold mb-2">Sort By</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={filterState.sort || 'featured'}
          onChange={e => handleChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <button
        className="w-full mt-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
        onClick={() => onChange({})}
        type="button"
      >
        Clear Filters
      </button>
    </div>
  );
} 