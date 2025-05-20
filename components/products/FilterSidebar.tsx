'use client';

import { useState, useCallback, useEffect } from 'react';
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
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
];

const COLOR_OPTIONS = [
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

const SIZE_OPTIONS = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
];

export default function FilterSidebar({ filters, onFilterChange, onReset }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

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
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Sort */}
      <div className="space-y-2">
        <Label>Sort by</Label>
        <Select
          value={localFilters.sort}
          onValueChange={(value) => handleChange('sort', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
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

      <Separator />

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

      {/* Colors */}
      <div className="space-y-4">
        <Label>Colors</Label>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_OPTIONS.map((color) => (
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

      <Separator />

      {/* Sizes */}
      <div className="space-y-4">
        <Label>Sizes</Label>
        <div className="grid grid-cols-2 gap-2">
          {SIZE_OPTIONS.map((size) => (
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

      <Separator />

      {/* In Stock */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={localFilters.inStock}
          onCheckedChange={(checked) => handleChange('inStock', checked)}
        />
        <Label
          htmlFor="inStock"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          In stock only
        </Label>
      </div>

      {/* Apply Button */}
      <Button
        className="w-full"
        onClick={handleApply}
        disabled={!hasActiveFilters}
      >
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        Apply Filters
      </Button>
    </div>
  );
} 