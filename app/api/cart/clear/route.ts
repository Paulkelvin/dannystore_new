import { NextResponse } from 'next/server';
import { sanityClientWrite } from '@/lib/sanityClient';

// Local storage key for cart
const CART_STORAGE_KEY = 'dannys-store-cart';

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const { email } = await request.json();
    
    if (!email) {
      console.error(`[${requestId}] ❌ No email provided for cart clearing`);
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Store the cart state in Sanity for the user
    // This will be used to sync cart state across devices
    await sanityClientWrite.create({
      _type: 'cartState',
      email,
      items: [],
      lastCleared: new Date().toISOString()
    });

    console.log(`[${requestId}] ✅ Cart cleared for user:`, email);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[${requestId}] ❌ Error clearing cart:`, error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
} 