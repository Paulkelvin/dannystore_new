import { NextResponse } from 'next/server';
import { sanityClientWrite } from '@/lib/sanityClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    console.log('🔍 Fetching orders for email:', email);
    
    // Fetch the user document if email is provided
    let userId = undefined;
    if (email) {
      const user = await sanityClientWrite.fetch(
        `*[_type == "user" && email == $email][0]{_id, email}`,
        { email }
      );
      if (user?._id) {
        userId = user._id;
      }
    }

    // Build the query dynamically based on whether userId is present
    let query = `*[_type == "order" && (
      customerEmail == $email || 
      user->email == $email${userId ? ' || (user._ref == $userId && defined(userId))' : ''}
    )] | order(createdAt desc) {
      _id,
      orderNumber,
      createdAt,
      totalAmount,
      paymentStatus,
      items[]{
        name,
        quantity,
        price,
        image
      },
      shippingAddress,
      user->{_id, email},
      userId
    }`;

    const params: { email: string; userId?: string } = { email };
    if (userId) params.userId = userId;

    console.log('🟧 Query:', query);
    console.log('🟧 Params:', params);
    const orders = await sanityClientWrite.fetch(query, params);
    console.log('🟧 Raw orders from Sanity:', orders);

    console.log('📦 Found orders:', orders.length);
    console.log('🔍 Order details:', orders.map((o: any) => ({
      id: o._id,
      number: o.orderNumber,
      status: o.paymentStatus,
      user: o.user?.email || o.userId || 'none'
    })));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 