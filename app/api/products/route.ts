import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';

export const runtime = 'edge'; // Use Edge Runtime for better performance
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'createdAt desc';
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = parseInt(searchParams.get('skip') || '0');
    const search = searchParams.get('search');

    // Build the GROQ query
    let query = `*[_type == "product"`;
    
    if (category) {
      query += ` && category->slug.current == $category`;
    }
    
    if (search) {
      query += ` && (name match $search || description match $search)`;
    }
    
    query += `] | order(${sort}) [$skip...$limit] {
      _id,
      name,
      price,
      "slug": slug.current,
      mainImage,
      category->,
      variants[],
      description
    }`;

    // Fetch products with caching
    const products = await client.fetch(query, {
      category,
      sort,
      limit,
      skip,
      search: search ? `*${search}*` : undefined,
    }, {
      next: { 
        revalidate: 3600,
        tags: ['products']
      }
    });

    // Transform products to include image URLs
    const transformedProducts = products.map((product: any) => ({
      ...product,
      mainImage: product.mainImage ? {
        ...product.mainImage,
        url: urlFor(product.mainImage).url(),
      } : null,
      variants: product.variants?.map((variant: any) => ({
        ...variant,
        image: variant.image ? {
          ...variant.image,
          url: urlFor(variant.image).url(),
        } : null,
      })) || [],
    }));

    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    headers.set('Content-Type', 'application/json');

    return NextResponse.json(transformedProducts, { headers });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 