import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';

export async function GET() {
  try {
    const query = `*[_type == "category"] | order(name asc) {
      _id,
      name,
      description,
      "slug": slug.current,
      image
    }`;

    const categories = await client.fetch(query, {}, { next: { revalidate: 300 } });

    // Transform categories to include image URLs
    const transformedCategories = categories.map((category: any) => ({
      ...category,
      image: category.image ? urlFor(category.image).url() : null,
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 