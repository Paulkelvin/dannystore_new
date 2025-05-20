import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sanityClientWrite as client } from '@/lib/sanityClient';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();
    
    // Get current user document
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: session.user.email }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updatedUser = await client
      .patch(user._id)
      .set({ password: hashedPassword })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
} 