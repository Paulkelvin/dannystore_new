import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payment_intent = searchParams.get('payment_intent');

  if (!payment_intent) {
    console.log('Missing payment_intent in request');
    return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 });
  }

  try {
    console.log('Fetching payment intent:', payment_intent);
    const intent = await stripe.paymentIntents.retrieve(payment_intent);
    console.log('Payment intent status:', intent.status);
    return NextResponse.json({ status: intent.status });
  } catch (err) {
    console.error('Error retrieving payment intent:', err);
    return NextResponse.json({ error: 'Unable to retrieve payment intent' }, { status: 500 });
  }
} 