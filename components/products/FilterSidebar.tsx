'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    priceMin: string;
    priceMax: string;
    color: string;
    size: string;
    inStock: boolean;
    sort: string;
  };
  onFilterChange: (filters: FilterSidebarProps['filters']) => void;
  onReset: () => void;
  products?: any[]; // Add products prop to check variant availability
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

// Default color options - will be filtered based on available variants
const DEFAULT_COLOR_OPTIONS = [
  'Black',
  'White',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Purple',
  'Pink',
  'Gray',
  'Brown',
];

// Default size options - will be filtered based on available variants
const DEFAULT_SIZE_OPTIONS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
];

export default function FilterSidebar({ filters, onFilterChange, onReset, products = [] }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Compute available colors and sizes based on products
  const availableColors = useMemo(() => {
    if (!products.length) return DEFAULT_COLOR_OPTIONS;
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
  }, [products]);

  const availableSizes = useMemo(() => {
    if (!products.length) return DEFAULT_SIZE_OPTIONS;
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
  }, [products]);

  const handleChange = useCallback((key: keyof typeof filters, value: string | boolean) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleApply = useCallback(() => {
    onFilterChange(localFilters);
  }, [localFilters, onFilterChange]);

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== '' && value !== false && value !== 'featured'
  );

  return (
    <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onReset}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div className="space-y-4">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceMin" className="text-sm text-gray-500">Min</Label>
              <Input
                id="priceMin"
                type="number"
                placeholder="Min"
                value={localFilters.priceMin}
                onChange={(e) => handleChange('priceMin', e.target.value)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceMax" className="text-sm text-gray-500">Max</Label>
              <Input
                id="priceMax"
                type="number"
                placeholder="Max"
                value={localFilters.priceMax}
                onChange={(e) => handleChange('priceMax', e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Availability */}
        <div className="space-y-4">
          <Label>Availability</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={localFilters.inStock}
              onCheckedChange={(checked) => 
                handleChange('inStock', checked as boolean)
              }
            />
            <Label
              htmlFor="inStock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              In Stock Only
            </Label>
          </div>
        </div>

        {/* Colors - Only show if there are available colors */}
        {availableColors.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label>Colors</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableColors.map((color) => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={localFilters.color === color}
                      onCheckedChange={(checked) => 
                        handleChange('color', checked ? color : '')
                      }
                    />
                    <Label
                      htmlFor={`color-${color}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {color}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Sizes - Only show if there are available sizes */}
        {availableSizes.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <Label>Sizes</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableSizes.map((size) => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={localFilters.size === size}
                      onCheckedChange={(checked) => 
                        handleChange('size', checked ? size : '')
                      }
                    />
                    <Label
                      htmlFor={`size-${size}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Sort */}
        <div className="space-y-4">
          <Label>Sort By</Label>
          <Select
            value={localFilters.sort}
            onValueChange={(value) => handleChange('sort', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sort option" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Apply Filters Button */}
        <Button
          className="w-full bg-[#FFC300] hover:bg-[#FFD740] text-[#333333] font-semibold"
          onClick={handleApply}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
} 