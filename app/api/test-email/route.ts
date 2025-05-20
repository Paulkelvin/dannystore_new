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

export async function GET(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] 📧 Testing email configuration`);

  try {
    // Verify SMTP connection
    console.log(`[${requestId}] 🔍 Verifying SMTP connection...`);
    await transporter.verify();
    console.log(`[${requestId}] ✅ SMTP connection verified`);

    // Send test email
    console.log(`[${requestId}] 📧 Sending test email to:`, process.env.SMTP_USER);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: 'Test Email from Danny\'s Store',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email sent at ${new Date().toISOString()}</p>
        <p>If you receive this, your email configuration is working correctly!</p>
      `,
    });

    console.log(`[${requestId}] ✅ Test email sent:`, info.messageId);
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[${requestId}] ❌ Error testing email:`, error);
    if (error instanceof Error) {
      console.error(`[${requestId}] ❌ Error details:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      { error: 'Failed to send test email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 