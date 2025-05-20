// src/app/products/[slug]/page.tsx

import { groq } from 'next-sanity';
import { sanityFetch } from '@/lib/sanity';
import ProductDisplay from '@/components/products/ProductDisplay';
import { Product } from '@/types';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';

// Query to get a single product by slug
const productQuery = groq`
  *[_type == "product" && slug.current == $slug][0] {
    _id,
    _type,
    name,
    slug,
    description,
    shortDescription,
    price,
    rating,
    reviewCount,
    stock,
    tags,
    keyBenefits,
    specifications[] {
      _key,
      key,
      value
    },
    mainImage {
      asset-> {
        _id,
        url
      },
      alt
    },
    gallery[] {
      asset-> {
        _id,
        url
      },
      alt
    },
    variants[] {
      _key,
      sku,
      price,
      stock,
      color-> {
        _id,
        name,
        value
      },
      size-> {
        _id,
        name,
        value
      }
    },
    category-> {
      _id,
      name,
      slug
    }
  }
`;

// Query to get related products (same category, excluding current product)
const relatedProductsQuery = groq`
  *[_type == "product" && category._ref == $categoryId && _id != $productId][0...4] {
    _id,
    _type,
    name,
    slug,
    price,
    rating,
    reviewCount,
    stock,
    mainImage {
      asset-> {
        _id,
        url
      },
      alt
    },
    variants[] {
      _key,
      sku,
      price,
      stock,
      color-> {
        _id,
        name,
        value
      },
      size-> {
        _id,
        name,
        value
      }
    }
  }
`;

// Cache the product fetch for 1 hour
const getCachedProduct = unstable_cache(
  async (slug: string) => {
    return sanityFetch<Product>({
      query: productQuery,
      params: { slug },
      tags: [`product-${slug}`],
    });
  },
  ['product'],
  { revalidate: 3600 } // Cache for 1 hour
);

// Cache related products fetch for 1 hour
const getCachedRelatedProducts = unstable_cache(
  async (categoryId: string, productId: string) => {
    return sanityFetch<Product[]>({
      query: relatedProductsQuery,
      params: {
        categoryId,
        productId,
      },
      tags: [`related-products-${categoryId}`],
    });
  },
  ['related-products'],
  { revalidate: 3600 } // Cache for 1 hour
);

interface ProductPageProps {
  params: {
    slug: string;
  };
}

interface ProductSlug {
  slug: string;
}

export async function generateStaticParams() {
  const products = await sanityFetch<ProductSlug[]>({
    query: groq`*[_type == "product"]{ "slug": slug.current }`,
    tags: ['all-products'],
  });

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  // Fetch product and related products in parallel
  const [product, relatedProducts] = await Promise.all([
    getCachedProduct(slug),
    getCachedProduct(slug).then(product => {
      if (!product?.category?._id) return [];
      return getCachedRelatedProducts(product.category._id, product._id);
    })
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductDisplay
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
