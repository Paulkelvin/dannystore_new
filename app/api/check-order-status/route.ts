import { NextResponse } from 'next/server';
import { sanityClientWrite } from '@/lib/sanityClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get('payment_intent');

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 });
  }

  try {
    // Find the order by paymentIntentId
    const order = await sanityClientWrite.fetch(
      `*[_type == "order" && paymentIntentId == $paymentIntentId][0]{
        _id,
        orderNumber,
        paymentStatus,
        paymentIntentId,
        createdAt,
        customerEmail,
        totalAmount
      }`,
      { paymentIntentId }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Also check for any pending orders with the same orderNumber
    const pendingOrders = await sanityClientWrite.fetch(
      `*[_type == "order" && orderNumber == $orderNumber && paymentStatus == "pending"]{
        _id,
        orderNumber,
        paymentStatus,
        paymentIntentId,
        createdAt
      }`,
      { orderNumber: order.orderNumber }
    );

    return NextResponse.json({
      order,
      pendingOrders,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking order status:', error);
    return NextResponse.json(
      { error: 'Failed to check order status' },
      { status: 500 }
    );
  }
} 