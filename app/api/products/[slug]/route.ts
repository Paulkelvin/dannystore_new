import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityClient';

interface SanityImage {
  _type: string;
  asset: {
    _ref: string;
    _type: string;
  };
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  rating?: number;
  featured?: boolean;
  specifications?: any[];
  keyBenefits?: string[];
  colors?: string[];
  sizes?: string[];
  slug: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  image?: SanityImage;
  images?: SanityImage[];
  variants?: Array<{
    _key: string;
    color?: string;
    size?: string;
    price?: number;
    stock?: number;
    image?: SanityImage;
  }>;
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const query = `*[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      description,
      price,
      stock,
      rating,
      featured,
      specifications,
      keyBenefits,
      colors,
      sizes,
      "slug": slug.current,
      category-> {
        _id,
        name,
        "slug": slug.current
      },
      image,
      images,
      variants[] {
        _key,
        color,
        size,
        price,
        stock,
        image
      }
    }`;

    const product = await client.fetch<Product>(
      query,
      { slug },
      { next: { revalidate: 60 } }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform the product to include image URLs
    const transformedProduct = {
      ...product,
      image: (product.image && product.image.asset) ? (urlFor(product.image)?.url() ?? null) : null,
      images: product.images?.map(img => (img && img.asset) ? (urlFor(img)?.url() ?? null) : null).filter(Boolean) ?? [],
      variants: product.variants?.map(variant => ({
        ...variant,
        image: (variant.image && variant.image.asset) ? (urlFor(variant.image)?.url() ?? null) : null,
      })) ?? [],
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
} 