import React, { useState } from 'react';

export interface ProductFiltersProps {
  categories: { _id: string; name: string }[];
  colors: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
  onChange: (filters: ProductFilterState) => void;
  filterState: ProductFilterState;
  showCategory?: boolean;
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
}: ProductFiltersProps) {
  const [priceMin, setPriceMin] = useState(filterState.priceMin ?? minPrice);
  const [priceMax, setPriceMax] = useState(filterState.priceMax ?? maxPrice);

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
            value={filterState.category || ''}
            onChange={e => handleChange('category', e.target.value)}
          >
            <option value="">All</option>
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
      {colors.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-2">Color</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={filterState.color || ''}
            onChange={e => handleChange('color', e.target.value)}
          >
            <option value="">All</option>
            {colors.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>
      )}
      {sizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold mb-2">Size</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={filterState.size || ''}
            onChange={e => handleChange('size', e.target.value)}
          >
            <option value="">All</option>
            {sizes.map(size => (
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