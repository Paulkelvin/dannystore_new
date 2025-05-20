import { NextResponse } from 'next/server';
import { sanityClientWrite } from '@/lib/sanityClient';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get('payment_intent');

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 });
  }

  try {
    console.log('🔍 Checking order status for payment intent:', paymentIntentId);
    
    // First, verify the payment intent status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log('💳 Payment intent status from Stripe:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      created: new Date(paymentIntent.created * 1000).toISOString()
    });

    // Find the order by paymentIntentId
    const order = await sanityClientWrite.fetch(
      `*[_type == "order" && paymentIntentId == $paymentIntentId][0]{
        _id,
        orderNumber,
        paymentStatus,
        paymentIntentId,
        createdAt,
        customerEmail,
        totalAmount,
        shippingAddress,
        user,
        userId
      }`,
      { paymentIntentId }
    );

    console.log('📦 Found order in Sanity:', {
      orderId: order?._id,
      orderNumber: order?.orderNumber,
      paymentStatus: order?.paymentStatus,
      hasShippingAddress: !!order?.shippingAddress,
      hasUser: !!order?.user,
      userId: order?.userId
    });

    if (!order) {
      console.log('❌ No order found for payment intent:', paymentIntentId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If the payment intent is succeeded but the order is not marked as paid,
    // update the order status
    if (paymentIntent.status === 'succeeded' && order.paymentStatus !== 'paid') {
      console.log('⚠️ Payment intent succeeded but order not marked as paid, updating...');
      const updatedOrder = await sanityClientWrite.patch(order._id)
        .set({
          paymentStatus: 'paid',
          paidAt: new Date().toISOString(),
          paymentDetails: {
            paymentIntentId: paymentIntent.id,
            paymentMethod: paymentIntent.payment_method,
            paymentMethodType: paymentIntent.payment_method_types?.[0],
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            created: new Date(paymentIntent.created * 1000).toISOString()
          }
        })
        .commit();

      console.log('✅ Updated order status:', {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        paymentStatus: updatedOrder.paymentStatus,
        paidAt: updatedOrder.paidAt
      });

      // Also check for any pending orders with the same orderNumber and mark them as obsolete
      const pendingOrders = await sanityClientWrite.fetch(
        `*[_type == "order" && orderNumber == $orderNumber && _id != $orderId && paymentStatus == "pending"]{
          _id,
          orderNumber,
          paymentStatus,
          paymentIntentId,
          createdAt
        }`,
        { orderNumber: order.orderNumber, orderId: order._id }
      );

      if (pendingOrders.length > 0) {
        console.log('📋 Found pending orders to clean up:', pendingOrders);
        for (const pendingOrder of pendingOrders) {
          await sanityClientWrite.patch(pendingOrder._id)
            .set({
              paymentStatus: 'obsolete',
              obsoleteReason: 'New payment completed',
              obsoleteAt: new Date().toISOString()
            })
            .commit();
          console.log('🗑️ Marked order as obsolete:', pendingOrder._id);
        }
      }

      return NextResponse.json({
        order: updatedOrder,
        paymentIntentStatus: paymentIntent.status,
        pendingOrders,
        timestamp: new Date().toISOString()
      });
    }

    // Also check for any pending orders with the same orderNumber
    const pendingOrders = await sanityClientWrite.fetch(
      `*[_type == "order" && orderNumber == $orderNumber && _id != $orderId && paymentStatus == "pending"]{
        _id,
        orderNumber,
        paymentStatus,
        paymentIntentId,
        createdAt
      }`,
      { orderNumber: order.orderNumber, orderId: order._id }
    );

    console.log('📋 Pending orders with same order number:', pendingOrders);

    return NextResponse.json({
      order,
      paymentIntentStatus: paymentIntent.status,
      pendingOrders,
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