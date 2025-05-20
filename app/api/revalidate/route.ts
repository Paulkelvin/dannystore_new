import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] 🔄 Revalidation request received`);

  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const secret = searchParams.get('secret');

    console.log(`[${requestId}] 📝 Revalidation parameters:`, {
      path,
      hasSecret: !!secret,
      expectedSecret: !!process.env.REVALIDATE_SECRET_TOKEN
    });

    // Check the secret and next parameters
    if (!process.env.REVALIDATE_SECRET_TOKEN) {
      console.error(`[${requestId}] ❌ REVALIDATE_SECRET_TOKEN not set in environment`);
      return NextResponse.json(
        { error: 'Revalidation not configured' },
        { status: 500 }
      );
    }

    if (secret !== process.env.REVALIDATE_SECRET_TOKEN) {
      console.error(`[${requestId}] ❌ Invalid revalidation token`);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!path) {
      console.error(`[${requestId}] ❌ Missing path parameter`);
      return NextResponse.json(
        { error: 'Missing path parameter' },
        { status: 400 }
      );
    }

    // Revalidate the path
    console.log(`[${requestId}] 🔄 Revalidating path:`, path);
    revalidatePath(path);
    console.log(`[${requestId}] ✅ Successfully revalidated path:`, path);

    return NextResponse.json({ 
      revalidated: true, 
      path,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[${requestId}] ❌ Error revalidating:`, error);
    if (error instanceof Error) {
      console.error(`[${requestId}] ❌ Error details:`, {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      { error: 'Error revalidating' },
      { status: 500 }
    );
  }
} 