import { NextResponse } from 'next/server';
import { sanityFetch } from '@/lib/sanity';
import { groq } from 'next-sanity';

const collectionsQuery = groq`*[_type == "collection" && isActive == true] {
  _id,
  title,
  "slug": slug.current,
  marqueeImage,
  callToActionText
}`;

export async function GET() {
  try {
    const collections = await sanityFetch({
      query: collectionsQuery,
      tags: ['collections'],
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
} 