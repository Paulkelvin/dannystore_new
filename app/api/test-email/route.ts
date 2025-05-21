import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER!);
    
    // Test the connection
    await transporter.verify();
    console.log('✅ SMTP connection verified');

    // Send a test email
    const testEmail = process.env.EMAIL_FROM;
    console.log('📧 Testing email configuration');
    console.log('🔍 Verifying SMTP connection...');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: testEmail,
      subject: 'Test Email from Danny\'s Store',
      text: 'This is a test email to verify the email configuration.',
      html: '<p>This is a test email to verify the email configuration.</p>',
    });

    console.log('✅ Test email sent:', info.messageId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Email configuration is working',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send test email',
        details: error
      },
      { status: 500 }
    );
  }
} 