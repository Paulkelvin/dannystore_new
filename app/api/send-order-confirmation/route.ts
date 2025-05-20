import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] 📧 /api/send-order-confirmation called at ${new Date().toISOString()}`);
  
  try {
    // Log request headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log(`[${requestId}] 📧 Request headers:`, {
      contentType: headers['content-type'],
      origin: headers['origin'],
      referer: headers['referer'],
      userAgent: headers['user-agent']
    });

    // Get and log the raw body
    const body = await request.text();
    console.log(`[${requestId}] 📧 Raw request body:`, {
      length: body.length,
      preview: body.substring(0, 100) + '...',
      timestamp: new Date().toISOString()
    });

    // Parse and validate the body
    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
      console.log(`[${requestId}] 📧 Parsed request body:`, {
        hasOrderId: !!parsedBody.orderId,
        hasEmail: !!parsedBody.email,
        hasOrderNumber: !!parsedBody.orderNumber,
        hasItems: !!parsedBody.items?.length,
        hasShippingAddress: !!parsedBody.shippingAddress,
        timestamp: new Date().toISOString()
      });
    } catch (parseError) {
      console.error(`[${requestId}] ❌ Failed to parse request body:`, parseError);
      throw new Error('Invalid JSON in request body');
    }

    const {
      orderId,
      email,
      orderNumber,
      paymentIntentId,
      amount,
      currency,
      items,
      shippingAddress,
      paidAt
    } = parsedBody;

    // Validate required fields
    if (!email) {
      console.error(`[${requestId}] ❌ Missing email in request`);
      throw new Error('Email is required');
    }
    if (!orderNumber) {
      console.error(`[${requestId}] ❌ Missing orderNumber in request`);
      throw new Error('Order number is required');
    }
    if (!items?.length) {
      console.error(`[${requestId}] ❌ No items in order`);
      throw new Error('Order must contain items');
    }

    // Format currency
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

    // Format date
    const formattedDate = new Date(paidAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short'
    });

    // Log email preparation
    console.log(`[${requestId}] 📧 Preparing email for order:`, {
      orderNumber,
      email,
      itemCount: items.length,
      amount: formattedAmount,
      date: formattedDate
    });

    // Format items list
    const itemsList = items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.name}
          ${item.color ? `<br><small>Color: ${item.color}</small>` : ''}
          ${item.size ? `<br><small>Size: ${item.size}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase(),
          }).format(item.price)}
        </td>
      </tr>
    `).join('');

    // Format shipping address
    const formattedAddress = `
      ${shippingAddress.name}<br>
      ${shippingAddress.line1}<br>
      ${shippingAddress.line2 ? `${shippingAddress.line2}<br>` : ''}
      ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}<br>
      ${shippingAddress.country}
    `;

    // Create email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .order-info { background: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th { text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
              <p>Thank you for your order!</p>
            </div>
            
            <div class="order-info">
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Order Date:</strong> ${formattedDate}</p>
              <p><strong>Payment ID:</strong> ${paymentIntentId}</p>
            </div>

            <h2>Order Details</h2>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <div class="total">
              <p>Total: ${formattedAmount}</p>
            </div>

            <h2>Shipping Address</h2>
            <div class="order-info">
              ${formattedAddress}
            </div>

            <div class="footer">
              <p>If you have any questions about your order, please contact our customer service.</p>
              <p>© ${new Date().getFullYear()} Danny's Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Log email sending attempt
    console.log(`[${requestId}] 📧 Attempting to send email:`, {
      to: email,
      from: process.env.SMTP_FROM,
      subject: `Order Confirmation - ${orderNumber}`,
      timestamp: new Date().toISOString()
    });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html,
    });

    console.log(`[${requestId}] ✅ Email sent successfully:`, {
      messageId: info.messageId,
      response: info.response,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[${requestId}] ❌ Error sending order confirmation email:`, error);
    if (error instanceof Error) {
      console.error(`[${requestId}] ❌ Error details:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      { 
        error: 'Failed to send order confirmation email',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 