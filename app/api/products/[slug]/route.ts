import { NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { urlFor } from '@/lib/sanityImage';

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

    const product = await client.fetch(
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
      image: product.image ? urlFor(product.image).url() : null,
      images: product.images?.map((img: any) => urlFor(img).url()) || [],
      variants: product.variants?.map((variant: any) => ({
        ...variant,
        image: variant.image ? urlFor(variant.image).url() : null,
      })) || [],
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