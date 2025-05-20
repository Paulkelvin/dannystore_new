import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  try {
    const { clientSecret } = await request.json();

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Missing client secret' },
        { status: 400 }
      );
    }

    // Extract payment intent ID from client secret
    const paymentIntentId = clientSecret.split('_secret_')[0];
    
    console.log('🔄 Cancelling payment intent:', paymentIntentId);

    // Cancel the payment intent
    const cancelledIntent = await stripe.paymentIntents.cancel(paymentIntentId, {
      cancellation_reason: 'requested_by_customer'
    });

    console.log('✅ Payment intent cancelled:', {
      id: cancelledIntent.id,
      status: cancelledIntent.status
    });

    return NextResponse.json({ 
      success: true,
      status: cancelledIntent.status 
    });
  } catch (error) {
    console.error('❌ Error cancelling payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to cancel payment intent' },
      { status: 500 }
    );
  }
} 