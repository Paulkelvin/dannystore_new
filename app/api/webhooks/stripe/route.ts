import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { sanityClientWrite } from '@/lib/sanityClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

console.log('Startup: NEXT_PUBLIC_BASE_URL is', process.env.NEXT_PUBLIC_BASE_URL);

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

// This is your Stripe webhook secret for testing your endpoint locally.
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] 🔔 Webhook request received at ${new Date().toISOString()}`);

  try {
    // Get the signature from the headers
    const headersList = headers();
    const signature = headersList.get('stripe-signature');
    console.log(`[${requestId}] 📝 Headers received:`, {
      hasSignature: !!signature,
      contentType: headersList.get('content-type'),
      userAgent: headersList.get('user-agent'),
      host: headersList.get('host')
    });

    if (!signature) {
      console.error(`[${requestId}] ❌ No signature found in request`);
      return NextResponse.json(
        { error: 'No signature found in request' },
        { status: 400 }
      );
    }

    // Get the raw body as text
    const body = await request.text();
    console.log(`[${requestId}] 📦 Raw webhook body received:`, {
      length: body.length,
      preview: body.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });

    let event: Stripe.Event;

    try {
      // Verify the event using the signature and webhook secret
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      console.log(`[${requestId}] ✅ Webhook signature verified for event:`, {
        type: event.type,
        id: event.id,
        created: new Date(event.created * 1000).toISOString(),
        apiVersion: event.api_version,
        hasData: !!event.data?.object
      });
    } catch (err) {
      console.error(`[${requestId}] ❌ Webhook signature verification failed:`, err);
      if (err instanceof Error) {
        console.error(`[${requestId}] ❌ Error details:`, {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
      }
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`[${requestId}] 🔄 Processing event:`, {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString()
    });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[${requestId}] 💳 Payment intent succeeded - FULL DETAILS:`, {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customer: paymentIntent.customer,
          metadata: paymentIntent.metadata,
          status: paymentIntent.status,
          shipping: paymentIntent.shipping,
          created: new Date(paymentIntent.created * 1000).toISOString()
        });

        try {
          const orderId = paymentIntent.metadata.orderId;
          const customerEmail = paymentIntent.metadata.customerEmail;
          const userId = paymentIntent.metadata.userId;
          const shippingAddress = paymentIntent.shipping;

          if (!orderId) {
            console.error(`[${requestId}] ❌ No orderId in payment intent metadata`);
            throw new Error('No orderId in payment intent metadata');
          }

          // Fetch the order to get items (for images)
          console.log(`[${requestId}] 🔍 Fetching order with ID:`, orderId);
          const order = await sanityClientWrite.fetch(
            `*[_type == "order" && _id == $orderId][0]{
              _id,
              orderNumber,
              paymentStatus,
              customerEmail,
              items,
              shippingAddress,
              paymentIntentId,
              user,
              userId
            }`,
            { orderId }
          );
          
          if (!order) {
            console.error(`[${requestId}] ❌ Order not found for orderId:`, orderId);
            throw new Error('Order not found for orderId: ' + orderId);
          }

          console.log(`[${requestId}] 📦 Found order - FULL DETAILS:`, {
            orderId: order._id,
            orderNumber: order.orderNumber,
            paymentStatus: order.paymentStatus,
            customerEmail: order.customerEmail,
            hasItems: !!order.items?.length,
            currentPaymentIntentId: order.paymentIntentId,
            hasUser: !!order.user,
            userId: order.userId
          });

          // Find or create user document
          let userDoc;
          if (customerEmail) {
            console.log(`[${requestId}] 👤 Looking up user document for email:`, customerEmail);
            userDoc = await sanityClientWrite.fetch(`*[_type == "user" && email == $email][0]`, { email: customerEmail });
            
            if (!userDoc) {
              console.log(`[${requestId}] 👤 Creating new user document for email:`, customerEmail);
              userDoc = await sanityClientWrite.create({
                _type: 'user',
                email: customerEmail,
                name: shippingAddress?.name || undefined,
                shippingAddresses: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
              console.log(`[${requestId}] ✅ Created new user document:`, userDoc._id);
            } else {
              console.log(`[${requestId}] ✅ Found existing user document:`, userDoc._id);
            }
          }

          // Handle shipping address for user profile
          const addressToSave = shippingAddress || order.shippingAddress;
          if (userDoc && addressToSave) {
            console.log(`[${requestId}] 📬 Processing shipping address for user profile:`, {
              userId: userDoc._id,
              email: customerEmail,
              hasExistingAddresses: !!userDoc.shippingAddresses?.length
            });

            try {
              // Clean and validate the shipping address
              const clean = (val: any) => typeof val === 'string' ? val.replace(/[\u200B-\u200D\uFEFF]/g, '').trim() : val;
              const formatPostalCode = (code: string, country: string) => {
                if (!code) return '';
                const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                if (country === 'US' && cleaned.length === 9) {
                  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
                }
                return cleaned;
              };

              const cleanedAddress = {
                name: clean(addressToSave.name),
                line1: clean(addressToSave.line1),
                line2: clean(addressToSave.line2),
                city: clean(addressToSave.city),
                state: clean(addressToSave.state),
                postalCode: formatPostalCode(clean(addressToSave.postalCode), clean(addressToSave.country)),
                country: clean(addressToSave.country),
                lastUsed: new Date().toISOString()
              };

              // Validate required fields
              if (!cleanedAddress.line1 || !cleanedAddress.city || !cleanedAddress.state || !cleanedAddress.postalCode || !cleanedAddress.country) {
                console.error(`[${requestId}] ❌ Invalid shipping address - missing required fields:`, cleanedAddress);
                throw new Error('Invalid shipping address - missing required fields');
              }

              console.log(`[${requestId}] 📬 Cleaned shipping address:`, cleanedAddress);

              // Check if address already exists
              const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, ' ').trim();
              const existingAddresses = userDoc.shippingAddresses || [];
              const existingIndex = existingAddresses.findIndex((addr: any) => 
                normalize(addr.line1) === normalize(cleanedAddress.line1) &&
                normalize(addr.city) === normalize(cleanedAddress.city) &&
                normalize(addr.state) === normalize(cleanedAddress.state) &&
                normalize(addr.postalCode) === normalize(cleanedAddress.postalCode) &&
                normalize(addr.country) === normalize(cleanedAddress.country)
              );

              if (existingIndex === -1) {
                // Add new address at the beginning of the array
                console.log(`[${requestId}] 📬 Adding new shipping address to user profile`);
                const patch = sanityClientWrite
                  .patch(userDoc._id)
                  .setIfMissing({ shippingAddresses: [] })
                  .insert('after', 'shippingAddresses[0]', [cleanedAddress]);

                const updatedUser = await patch.commit();
                console.log(`[${requestId}] ✅ Updated user profile with new address:`, {
                  userId: updatedUser._id,
                  addressCount: updatedUser.shippingAddresses?.length,
                  addresses: updatedUser.shippingAddresses
                });
                // Fetch and log the user document after update
                const userAfterUpdate = await sanityClientWrite.fetch(`*[_type == "user" && _id == $id][0]`, { id: userDoc._id });
                console.log(`[${requestId}] 🕵️‍♂️ User document after address update:`, userAfterUpdate);
              } else {
                // Update lastUsed timestamp for existing address
                console.log(`[${requestId}] 📬 Updating lastUsed timestamp for existing address`);
                const patch = sanityClientWrite
                  .patch(userDoc._id)
                  .set({
                    [`shippingAddresses[${existingIndex}].lastUsed`]: new Date().toISOString()
                  });

                const updatedUser = await patch.commit();
                console.log(`[${requestId}] ✅ Updated lastUsed timestamp for address:`, {
                  userId: updatedUser._id,
                  addressIndex: existingIndex,
                  addresses: updatedUser.shippingAddresses
                });
                // Fetch and log the user document after update
                const userAfterUpdate = await sanityClientWrite.fetch(`*[_type == "user" && _id == $id][0]`, { id: userDoc._id });
                console.log(`[${requestId}] 🕵️‍♂️ User document after address update:`, userAfterUpdate);
              }

              // Send order confirmation email
              console.log(`[${requestId}] 📧 Preparing to send order confirmation email:`, {
                orderId: order._id,
                orderNumber: order.orderNumber,
                customerEmail,
                baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
                timestamp: new Date().toISOString()
              });

              try {
                const emailEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-order-confirmation`;
                console.log(`[${requestId}] 📧 Calling email endpoint:`, emailEndpoint);

                const emailPayload = {
                  orderId: order._id,
                  email: customerEmail,
                  orderNumber: order.orderNumber,
                  paymentIntentId: paymentIntent.id,
                  amount: paymentIntent.amount,
                  currency: paymentIntent.currency,
                  items: order.items,
                  shippingAddress: cleanedAddress,
                  paidAt: new Date().toISOString()
                };

                console.log(`[${requestId}] 📧 Email payload prepared:`, {
                  hasOrderId: !!emailPayload.orderId,
                  hasEmail: !!emailPayload.email,
                  hasOrderNumber: !!emailPayload.orderNumber,
                  hasItems: !!emailPayload.items?.length,
                  hasShippingAddress: !!emailPayload.shippingAddress,
                  timestamp: new Date().toISOString()
                });

                const emailResponse = await fetch(emailEndpoint, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId
                  },
                  body: JSON.stringify(emailPayload)
                });

                const emailResponseText = await emailResponse.text();
                console.log(`[${requestId}] 📧 Email endpoint response:`, {
                  status: emailResponse.status,
                  statusText: emailResponse.statusText,
                  responseText: emailResponseText,
                  timestamp: new Date().toISOString()
                });

                if (!emailResponse.ok) {
                  console.error(`[${requestId}] ⚠️ Failed to send order confirmation email:`, {
                    status: emailResponse.status,
                    statusText: emailResponse.statusText,
                    response: emailResponseText,
                    timestamp: new Date().toISOString()
                  });
                } else {
                  console.log(`[${requestId}] ✅ Order confirmation email sent successfully:`, {
                    response: emailResponseText,
                    timestamp: new Date().toISOString()
                  });
                }
              } catch (emailError) {
                console.error(`[${requestId}] ⚠️ Error sending order confirmation email:`, {
                  error: emailError instanceof Error ? {
                    message: emailError.message,
                    stack: emailError.stack,
                    name: emailError.name
                  } : emailError,
                  timestamp: new Date().toISOString()
                });
              }

              // Revalidate the account page
              try {
                const revalidateResponse = await fetch(
                  `${process.env.NEXT_PUBLIC_BASE_URL}/api/revalidate?path=/account&secret=${process.env.REVALIDATE_SECRET_TOKEN}`,
                  { method: 'GET' }
                );
                if (!revalidateResponse.ok) {
                  console.error(`[${requestId}] ⚠️ Failed to revalidate account page:`, await revalidateResponse.text());
                } else {
                  console.log(`[${requestId}] ✅ Successfully revalidated account page`);
                }
              } catch (revalidateError) {
                console.error(`[${requestId}] ⚠️ Error revalidating account page:`, revalidateError);
              }

              console.log(`[${requestId}] 🟦 payment_intent.succeeded: paymentIntent.status=`, paymentIntent.status);

              // Update order status
              const updateData = {
                paymentStatus: 'paid',
                paymentIntentId: paymentIntent.id,
                paidAt: new Date().toISOString()
              };

              console.log(`[${requestId}] 🟦 Updating order status to:`, updateData.paymentStatus);

              const updatedOrder = await sanityClientWrite.patch(order._id)
                .set(updateData)
                .commit();

              console.log(`[${requestId}] 🟦 Order after update:`, updatedOrder);

              // Clear cart for the customer
              if (order.customerEmail) {
                try {
                  // Call the cart clear API endpoint
                  const clearCartResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/clear`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: order.customerEmail })
                  });

                  if (!clearCartResponse.ok) {
                    throw new Error(`Failed to clear cart: ${clearCartResponse.statusText}`);
                  }

                  console.log(`[${requestId}] 🛒 Cart cleared for customer:`, order.customerEmail);
                } catch (error) {
                  console.error(`[${requestId}] ❌ Error clearing cart:`, error);
                  // Don't fail the webhook if cart clearing fails
                }
              }

              // Clean up other pending orders
              if (order && customerEmail) {
                console.log(`[${requestId}] 🧹 Cleaning up other pending orders for:`, customerEmail);
                const otherPendingOrders = await sanityClientWrite.fetch(
                  `*[_type == "order" && customerEmail == $email && _id != $orderId && paymentStatus == "pending"]{_id}`,
                  { email: customerEmail, orderId }
                );
                
                console.log(`[${requestId}] 📋 Found ${otherPendingOrders.length} pending orders to clean up`);
                
                for (const o of otherPendingOrders) {
                  console.log(`[${requestId}] 🗑️ Marking order as obsolete:`, o._id);
                  await sanityClientWrite.patch(o._id)
                    .set({ 
                      paymentStatus: 'obsolete',
                      obsoleteReason: 'New payment completed',
                      obsoleteAt: new Date().toISOString()
                    })
                  .commit();
                }
              }

              console.log(`[${requestId}] 🟦 Webhook handler completed for order:`, orderId);

              return NextResponse.json({ received: true, orderId });
            } catch (addressError) {
              console.error(`[${requestId}] ❌ Error processing shipping address:`, addressError);
              // Don't throw - we still want to complete the order update
            }
          }

          return NextResponse.json({ received: true, orderId });
        } catch (error) {
          console.error(`[${requestId}] ❌ Error processing payment_intent.succeeded:`, error);
          return NextResponse.json(
            { error: 'Error processing webhook' },
            { status: 500 }
          );
        }
      }
      default:
        console.log(`[${requestId}] ℹ️ Unhandled event type:`, event.type);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    console.error(`[${requestId}] ❌ Webhook error:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 