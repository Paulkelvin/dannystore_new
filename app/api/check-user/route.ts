import { NextResponse } from 'next/server';
import { sanityClientPublic } from '@/lib/sanityClient';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists and has a password
    const user = await sanityClientPublic.fetch(
      `*[_type == "user" && email == $email][0]{
        _id,
        password
      }`,
      { email }
    );

    return NextResponse.json({
      exists: !!user,
      hasPassword: !!user?.password
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { message: 'Failed to check user status' },
      { status: 500 }
    );
  }
} 