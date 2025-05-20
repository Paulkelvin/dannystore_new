// src/types/index.ts

import type { PortableTextBlock as PortableTextBlockType } from '@portabletext/types';
import type { Image as SanityImage, Slug } from '@sanity/types';
import { ReactNode } from 'react';

// Use the standard Portable Text block type
// You can extend this later if you add custom block types (e.g., custom components)
export type PortableTextBlock = PortableTextBlockType;

// Define a type for the core Sanity image reference object
export interface SanityImageReference {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

// --- Product Variant Types ---
export interface ProductVariantColor {
  _id: string;
  name: string;
  value: string;
  price?: number;
  images?: SanityImageReference[];
}

export interface ProductVariantSize {
  _id: string;
  name: string;
  stock: number;
  price?: number;
}

export interface ProductVariant {
  _key: string;
  sku: string;
  color?: ProductVariantColor;
  size?: ProductVariantSize;
  price?: number;
  stock?: number;
}

// --- Specification Type ---
export interface Specification {
  _key: string;
  _type: 'spec';
  key: string;
  value: string;
}

// --- Sanity Category Type ---
export interface Category {
  _id: string;
  name: string;
  description?: string;
}

// --- Updated Product Type to match Sanity schema ---
export interface Product {
  _id: string;
  name: string;
  slug: string | { current: string };
  description: PortableTextBlock[];
  shortDescription?: string;
  price: number;
  mainImage: SanityImageReference;
  gallery?: SanityImageReference[];
  rating?: number;
  reviewCount?: number;
  category?: Category;
  tags?: string[];
  benefits?: string[];
  keyBenefits?: string[];
  specifications?: Specification[];
  variants?: ProductVariant[];
  variantType?: string;
  stock: number;
  salesCount?: number;
}

// Review Types
export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

// Hero Carousel Types
export interface HeroImage {
  src: string;
  alt: string;
  cta: string;
  ctaUrl: string;
}

// Trust Signal Types
export interface TrustSignal {
  icon: ReactNode;
  text: string;
}

// Pillar Types
export interface Pillar {
  icon: ReactNode;
  title: string;
  description: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantTitle?: string;
  price: number;
  sku: string;
  image: SanityImageReference;
  color?: string;
  size?: string;
  quantity?: number;
}