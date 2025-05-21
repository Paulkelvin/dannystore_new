export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sanityClientPublic } from '@/lib/sanityClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user document with shipping addresses from Sanity
    const user = await sanityClientPublic.fetch(
      `*[_type == "user" && email == $email][0]{
        shippingAddresses
      }`,
      { email: userId }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Sort addresses by lastUsed timestamp, most recent first
    const addresses = (user.shippingAddresses || []).sort((a: any, b: any) => {
      const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
      const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
      return dateB - dateA;
    });

    console.log('🔎 /api/get-addresses:', { userId, addresses });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
} 