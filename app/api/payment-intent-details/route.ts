import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payment_intent = searchParams.get('payment_intent');

  if (!payment_intent) {
    return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(payment_intent);
    
    // Get billing_details from the first charge if available
    const charges = (intent as any).charges?.data;
    const billingEmail = charges && charges.length > 0 ? charges[0].billing_details?.email : undefined;
    const customerEmail = intent.metadata.customerEmail || 
                         intent.receipt_email || 
                         billingEmail;

    return NextResponse.json({ 
      customerEmail,
      status: intent.status,
      amount: intent.amount,
      currency: intent.currency
    });
  } catch (err) {
    console.error('Error retrieving payment intent details:', err);
    return NextResponse.json(
      { error: 'Unable to retrieve payment intent details' },
      { status: 500 }
    );
  }
} 