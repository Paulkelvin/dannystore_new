import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sanityClientWrite as client } from '@/lib/sanityClient';

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { index } = await request.json();
    
    // Get current user document
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: session.user.email }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove address at specified index
    const updatedAddresses = [...(user.shippingAddresses || [])];
    updatedAddresses.splice(index, 1);

    // Update user document
    const updatedUser = await client
      .patch(user._id)
      .set({ shippingAddresses: updatedAddresses })
      .commit();

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
} 