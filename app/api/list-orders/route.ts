import { NextResponse } from 'next/server';
import { sanityClientWrite } from '@/lib/sanityClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  try {
    console.log('🔍 Listing orders for email:', email);
    
    // Find all orders for this email
    const orders = await sanityClientWrite.fetch(
      `*[_type == "order" && (customerEmail == $email || user->email == $email)] | order(createdAt desc){
        _id,
        orderNumber,
        paymentStatus,
        paymentIntentId,
        createdAt,
        customerEmail,
        totalAmount,
        items[]{
          name,
          quantity,
          price,
          image{
            _type,
            asset->{
              _id,
              _ref,
              url
            }
          },
          color,
          size
        }
      }`,
      { email }
    );

    console.log('📦 Found orders:', orders.map((order: any) => ({
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.paymentStatus,
      paymentIntentId: order.paymentIntentId,
      createdAt: order.createdAt
    })));

    return NextResponse.json({
      orders,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error listing orders:', error);
    return NextResponse.json(
      { error: 'Failed to list orders' },
      { status: 500 }
    );
  }
} 