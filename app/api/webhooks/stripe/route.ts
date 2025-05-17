export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] 🔔 Webhook request received`);

  try {
    // Get the signature from the headers
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error(`[${requestId}] ❌ No signature found in request`);
      return NextResponse.json(
        { error: 'No signature found in request' },
        { status: 400 }
      );
    }

    // Get the raw body as text
    const body = await request.text();
    console.log(`[${requestId}] 📦 Received webhook body:`, {
      preview: body.substring(0, 200) + '...',
      length: body.length
    });

    let event: Stripe.Event;

    try {
      // Verify the event using the signature and webhook secret
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      console.log(`[${requestId}] ✅ Webhook signature verified`);
    } catch (err) {
      console.error(`[${requestId}] ⚠️ Webhook signature verification failed:`, err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`[${requestId}] 🔔 Processing Stripe webhook event:`, {
      type: event.type,
      id: event.id,
      created: new Date(event.created * 1000).toISOString()
    });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`[${requestId}] 💰 Processing payment_intent.succeeded:`, {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
          metadata: paymentIntent.metadata,
          created: new Date(paymentIntent.created * 1000).toISOString()
        });

        try {
          const orderId = paymentIntent.metadata.orderId;
          const customerEmail = paymentIntent.metadata.customerEmail;
          const shippingAddress = paymentIntent.shipping;

          if (!orderId) {
            console.error(`[${requestId}] ❌ No orderId in payment intent metadata`);
            throw new Error('No orderId in payment intent metadata');
          }

          // Fetch the order to get items (for images)
          console.log(`[${requestId}] 🔍 Fetching order:`, orderId);
          const order = await sanityClientWrite.fetch(`*[_type == "order" && _id == $orderId][0]`, { orderId });
          
          if (!order) {
            console.error(`[${requestId}] ❌ Order not found for orderId:`, orderId);
            throw new Error('Order not found for orderId: ' + orderId);
          }

          console.log(`[${requestId}] 📦 Found order:`, {
            orderId: order._id,
            currentStatus: order.paymentStatus,
            currentOrderNumber: order.orderNumber,
            createdAt: order.createdAt
          });

          // Update the existing order in Sanity
          const mappedShippingAddress = shippingAddress ? {
            name: shippingAddress.name,
            line1: shippingAddress.address?.line1,
            line2: shippingAddress.address?.line2,
            city: shippingAddress.address?.city,
            state: shippingAddress.address?.state,
            postalCode: shippingAddress.address?.postal_code,
            country: shippingAddress.address?.country,
          } : order.shippingAddress;

          console.log(`[${requestId}] 📝 Updating order with:`, {
            paymentStatus: 'paid',
            paymentIntentId: paymentIntent.id,
            orderNumber: paymentIntent.id,
            shippingAddress: mappedShippingAddress ? 'present' : 'unchanged'
          });

          const updateResult = await sanityClientWrite.patch(orderId)
            .set({
              paymentStatus: 'paid',
              paymentIntentId: paymentIntent.id,
              orderNumber: paymentIntent.id,
              shippingAddress: mappedShippingAddress,
              items: order.items?.map(item => ({
                ...item,
                image: item.image || undefined
              }))
            })
            .commit();

          console.log(`[${requestId}] ✅ Sanity update result:`, {
            transactionId: updateResult.transactionId,
            documentId: updateResult.documentId
          });

          // Verify the update
          const updatedOrder = await sanityClientWrite.fetch(`*[_type == "order" && _id == $orderId][0]`, { orderId });
          console.log(`[${requestId}] ✅ Verified order update:`, {
            orderId,
            paymentIntentId: updatedOrder.paymentIntentId,
            paymentStatus: updatedOrder.paymentStatus,
            orderNumber: updatedOrder.orderNumber,
            updatedAt: new Date().toISOString()
          });

          return NextResponse.json({ received: true });
        } catch (error) {
          console.error(`[${requestId}] ❌ Error processing payment_intent.succeeded:`, error);
          return NextResponse.json(
            { error: 'Error processing payment_intent.succeeded' },
            { status: 500 }
          );
        }
      }
      default: {
        console.log(`[${requestId}] ℹ️ Unhandled event type:`, event.type);
        return NextResponse.json({ received: true });
      }
    }
  } catch (error) {
    console.error(`[${requestId}] ❌ Error processing webhook:`, error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
} 