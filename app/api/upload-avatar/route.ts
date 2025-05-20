import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sanityClientWrite as client } from '@/lib/sanityClient';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    // Upload image to Sanity assets
    const asset = await client.assets.upload('image', file, {
      filename: (file as File).name,
      contentType: (file as File).type,
    });

    // Get user document
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: session.user.email }
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user image field
    await client.patch(user._id).set({ image: asset.url }).commit();
    return NextResponse.json({ success: true, imageUrl: asset.url });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
  }
} 