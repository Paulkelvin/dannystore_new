import { NextResponse } from 'next/server';
import { sanityClientWrite as client } from '@/lib/sanityClient';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    // Log token status (without exposing the actual token)
    const hasToken = !!process.env.SANITY_API_TOKEN;
    console.log('Sanity token status:', {
      hasToken,
      tokenLength: hasToken ? process.env.SANITY_API_TOKEN?.length : 0,
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET
    });

    // Delete all existing users
    const existingUsers = await client.fetch(
      `*[_type == "user"]{_id}`
    );

    if (existingUsers.length > 0) {
      const transaction = client.transaction();
      existingUsers.forEach((user: { _id: string }) => {
        transaction.delete(user._id);
      });
      await transaction.commit();
      console.log(`Deleted ${existingUsers.length} existing users`);
    }

    // Create a new user with a known password
    const email = 'test@example.com';
    const password = 'password123'; // This will be the password you can use to log in
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      _type: 'user',
      email,
      password: hashedPassword,
      accountStatus: 'active',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await client.create(newUser);
    console.log('Created new test user');

    return NextResponse.json({
      message: 'Users reset successfully',
      testUser: {
        email,
        password: 'password123' // Only returned in this response, not stored in plain text
      }
    });
  } catch (error) {
    console.error('Error resetting users:', error);
    return NextResponse.json(
      { message: 'Failed to reset users' },
      { status: 500 }
    );
  }
} 