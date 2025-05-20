import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sanityClientWrite } from '@/lib/sanityClient';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Initialize Stripe with the secret key
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
  throw new Error('Stripe secret key is not configured');
}

console.log('🔑 Stripe key prefix:', stripeKey.substring(0, 7) + '...');

const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    // Get session but never require it - default to guest
    let userId = 'guest';
    let userDoc = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        const email = session.user.email;
        if (email) {
          // Find or create user document
          userDoc = await sanityClientWrite.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email }
          );
          if (!userDoc) {
            userDoc = await sanityClientWrite.create({
              _type: 'user',
              email,
              name: session.user.name || undefined,
              shippingAddresses: [],
            });
            console.log(`[${requestId}] 👤 Created new user document:`, userDoc._id);
          }
          userId = userDoc._id;
        }
      }
    } catch (e) {
      // Session error - continue as guest
      console.log(`[${requestId}] 👤 Session error, continuing as guest:`, e);
    }

    const body = await request.json();
    console.log(`[${requestId}] 📦 Request body:`, body);
    const { amount, email, cartItems, shippingAddress, orderNumber: clientOrderNumber } = body;

    // Log cartItems for debugging
    console.log(`[${requestId}] 🟦 [Order API] cartItems received:`, cartItems);

    // Defensive check for cartItems
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.error(`[${requestId}] ❌ cartItems is missing or empty:`, cartItems);
      return NextResponse.json(
        { error: 'No cart items provided' },
        { status: 400 }
      );
    }
    console.log(`[${requestId}] 🟦 [Order API] cartItems sample:`, cartItems[0]);

    // Validate required fields
    if (!amount || !email) {
      console.log(`[${requestId}] ❌ Missing required fields:`, { amount: !!amount, email: !!email });
      return NextResponse.json(
        { error: 'Missing required fields: amount and email are required' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    const orderNumber = clientOrderNumber || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Clean shipping address fields
    const clean = (val: any) => typeof val === 'string' ? val.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() : val;
    const mappedShippingAddress = shippingAddress ? {
      name: clean(shippingAddress.fullName || shippingAddress.name),
      line1: clean(shippingAddress.address1 || shippingAddress.line1),
      line2: clean(shippingAddress.address2 || shippingAddress.line2),
      city: clean(shippingAddress.city),
      state: clean(shippingAddress.state),
      postalCode: clean(shippingAddress.zipCode || shippingAddress.postalCode),
      country: clean(shippingAddress.country || 'US'),
    } : undefined;

    try {
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: {
          customerEmail: email,
          userId,
          orderNumber,
        },
        receipt_email: email,
      });

      // Create or update order in Sanity
      let order;
      try {
        const existingOrder = await sanityClientWrite.fetch(
          `*[_type == "order" && orderNumber == $orderNumber && paymentStatus == 'pending'][0]`,
          { orderNumber }
        );

        const orderData: any = {
              items: cartItems,
              shippingAddress: mappedShippingAddress,
              totalAmount: amount / 100,
              updatedAt: new Date().toISOString(),
              paymentIntentId: paymentIntent.id,
              userId,
        };

        // Log orderData for debugging
        console.log(`[${requestId}] 🟦 [Order API] orderData to be saved:`, orderData);

        // Add user reference if we have a user document
        if (userDoc) {
          orderData.user = {
            _type: 'reference',
            _ref: userDoc._id
          };
        }

        if (existingOrder) {
          order = await sanityClientWrite.patch(existingOrder._id)
            .set(orderData)
            .commit();
          console.log(`[${requestId}] 📝 Updated existing order:`, order._id);
        } else {
          order = await sanityClientWrite.create({
            _type: 'order',
            orderNumber,
            customerEmail: email,
            ...orderData,
            paymentStatus: 'pending',
            createdAt: new Date().toISOString(),
          });
          console.log(`[${requestId}] 📦 Created new order:`, order._id);
        }

        // Log the saved order
        console.log(`[${requestId}] 🟦 [Order API] Order saved:`, order);

        // Update payment intent with order ID
        await stripe.paymentIntents.update(paymentIntent.id, {
          metadata: {
            orderId: order._id,
            customerEmail: email,
            orderNumber: orderNumber,
            userId,
          },
        });

        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          orderNumber: orderNumber,
        });

      } catch (sanityError: any) {
        console.error(`[${requestId}] ❌ Sanity error:`, sanityError);
        // Even if Sanity fails, return the payment intent
        return NextResponse.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          orderNumber: orderNumber,
          warning: 'Order creation failed, but payment intent was created',
        });
      }

    } catch (stripeError: any) {
      console.error(`[${requestId}] ❌ Stripe API error:`, {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message,
        statusCode: stripeError.statusCode,
        requestId: stripeError.requestId
      });
      return NextResponse.json(
        { error: stripeError.message || 'Error creating payment intent' },
        { status: stripeError.statusCode || 500 }
      );
    }

  } catch (err: any) {
    // Top-level error handler
    console.error(`[${requestId}] ❌ Unexpected error:`, err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 