import { NextResponse } from 'next/server';
import { sanityClientWrite } from '@/lib/sanityClient';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get('orderNumber');

  if (!orderNumber) {
    return NextResponse.json({ error: 'Missing orderNumber' }, { status: 400 });
  }

  try {
    console.log('🔍 Checking order status for order number:', orderNumber);
    
    // Find the order by orderNumber
    const order = await sanityClientWrite.fetch(
      `*[_type == "order" && orderNumber == $orderNumber]{
        _id,
        orderNumber,
        paymentStatus,
        paymentIntentId,
        createdAt,
        customerEmail,
        totalAmount,
        items[]{name, quantity, price}
      }`,
      { orderNumber }
    );

    console.log('📦 Found orders:', order);

    if (!order || order.length === 0) {
      console.log('❌ No order found for order number:', orderNumber);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Sort orders by createdAt to get the most recent one
    const sortedOrders = order.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Get the most recent order
    const latestOrder = sortedOrders[0];

    // If there's a payment intent ID, check its status in Stripe
    let paymentIntentStatus: string | null = null;
    let paymentIntentDetails: {
      status: Stripe.PaymentIntent.Status;
      amount: number;
      currency: string;
      created: string;
      metadata: Stripe.Metadata;
      last_payment_error: Stripe.PaymentIntent.LastPaymentError | null;
      charges: Array<{
        id: string;
        status: string;
        created: string;
        failure_message: string | null;
        failure_code: string | null;
      }>;
    } | null = null;
    if (latestOrder.paymentIntentId) {
      try {
        const intent = await stripe.paymentIntents.retrieve(latestOrder.paymentIntentId);
        paymentIntentStatus = intent.status;
        paymentIntentDetails = {
          status: intent.status,
          amount: intent.amount,
          currency: intent.currency,
          created: new Date(intent.created * 1000).toISOString(),
          metadata: intent.metadata,
          last_payment_error: intent.last_payment_error,
          charges: (intent as any).charges?.data?.map((charge: any) => ({
            id: charge.id,
            status: charge.status,
            created: new Date(charge.created * 1000).toISOString(),
            failure_message: charge.failure_message,
            failure_code: charge.failure_code
          }))
        };
        console.log('💳 Payment intent details:', paymentIntentDetails);
      } catch (error) {
        console.error('Error retrieving payment intent:', error);
      }
    }

    return NextResponse.json({
      order: latestOrder,
      allOrders: sortedOrders,
      paymentIntentStatus,
      paymentIntentDetails,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error checking order status:', error);
    return NextResponse.json(
      { error: 'Failed to check order status' },
      { status: 500 }
    );
  }
} 