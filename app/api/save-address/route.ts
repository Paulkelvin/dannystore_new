import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sanityClientWrite as client } from '@/lib/sanityClient';

export async function POST(request: Request) {
  // Debug: log session and request
  const session = await getServerSession();
  console.log('🔑 /api/save-address session:', session);
  const body = await request.text();
  console.log('📦 /api/save-address raw body:', body);
  // Parse JSON as before
  request.json = async () => JSON.parse(body);

  // Check for Sanity token
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN environment variable');
    return NextResponse.json(
      { error: 'Server configuration error: Missing API token' },
      { status: 500 }
    );
  }

  const userEmail = session.user.email;
  console.log('Attempting to save address for user:', userEmail);

  try {
    const { address } = await request.json();
    console.log('Received address data:', address);
    
    // Validate address fields
    const requiredFields = ['name', 'line1', 'city', 'state', 'postalCode', 'country'];
    for (const field of requiredFields) {
      if (!address || typeof address[field] !== 'string' || address[field].trim() === '') {
        console.error(`Missing or invalid address field: ${field}`, address);
        return NextResponse.json(
          { error: `Missing or invalid address field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Optional: ensure line2 exists as a string
    if (typeof address.line2 !== 'string') address.line2 = '';

    // Get current user document
    console.log('Fetching user document for:', userEmail);
    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: userEmail }
    );

    if (!user) {
      console.error('User not found:', userEmail);
      return NextResponse.json(
        { error: 'User not found. Please try logging out and back in.' },
        { status: 404 }
      );
    }

    console.log('Found user document:', user._id);

    // Append or update address
    const patch = client.patch(user._id).setIfMissing({ shippingAddresses: [] });
    
    // Check if address already exists
    const exists = (user.shippingAddresses || []).some((addr: any) =>
      addr.name === address.name &&
      addr.line1 === address.line1 &&
      addr.city === address.city &&
      addr.state === address.state &&
      addr.postalCode === address.postalCode &&
      addr.country === address.country
    );

    if (!exists) {
      console.log('Adding new address to user document');
      patch.append('shippingAddresses', [address]);
    } else {
      console.log('Address already exists, skipping');
    }

    const result = await patch.commit();
    console.log('Successfully saved address:', result);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving address:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      {
        error: 'Failed to save address',
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
} 