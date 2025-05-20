import { NextResponse } from 'next/server';
import { sanityClientWrite } from '@/lib/sanityClient';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user exists and is already active
    const existingUser = await sanityClientWrite.fetch(
      `*[_type == "user" && email == $email][0]{
        _id,
        accountStatus,
        password
      }`,
      { email }
    );

    if (existingUser?.accountStatus === 'active' && existingUser?.password) {
      return NextResponse.json(
        { message: 'Account already activated. Please log in.' },
        { status: 400 }
      );
    }

    // Hash the password
    console.log('Hashing password for user:', email);
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Verify the hash was created correctly
    console.log('Verifying hash format:', {
      length: hashedPassword.length,
      prefix: hashedPassword.substring(0, 7),
      isValidFormat: /^\$2[aby]\$\d+\$[./A-Za-z0-9]{53}$/.test(hashedPassword)
    });

    // Get all orders for this email to extract shipping and billing info
    const orders = await sanityClientWrite.fetch(
      `*[_type == "order" && customerEmail == $email] | order(createdAt desc){
        _id,
        shippingAddress,
        billingAddress,
        paymentStatus,
        totalAmount,
        items,
        createdAt
      }`,
      { email }
    );

    // Get the most recent paid order for default address
    const recentPaidOrder = orders.find((order: any) => order.paymentStatus === 'paid');

    try {
      // Create a transaction to handle both user creation and order updates
      const transaction = sanityClientWrite.transaction();

      if (existingUser) {
        // Update existing user
        console.log('Updating existing user with new password hash');
        transaction.patch(existingUser._id, {
          set: {
            password: hashedPassword,
            accountStatus: 'active',
            updatedAt: new Date().toISOString(),
            ...(recentPaidOrder?.shippingAddress && {
              name: recentPaidOrder.shippingAddress.name || recentPaidOrder.shippingAddress.fullName,
              shippingAddresses: [{
                _type: 'address',
                name: recentPaidOrder.shippingAddress.name || recentPaidOrder.shippingAddress.fullName,
                line1: recentPaidOrder.shippingAddress.line1 || recentPaidOrder.shippingAddress.address1,
                line2: recentPaidOrder.shippingAddress.line2 || recentPaidOrder.shippingAddress.address2,
                city: recentPaidOrder.shippingAddress.city,
                state: recentPaidOrder.shippingAddress.state,
                postalCode: recentPaidOrder.shippingAddress.postalCode || recentPaidOrder.shippingAddress.zipCode,
                country: recentPaidOrder.shippingAddress.country || 'US',
                isDefault: true
              }]
            })
          }
        });
      } else {
        // Create new user
        console.log('Creating new user with password hash');
        const userData = {
          _type: 'user',
          email,
          password: hashedPassword,
          accountStatus: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(recentPaidOrder?.shippingAddress && {
            name: recentPaidOrder.shippingAddress.name || recentPaidOrder.shippingAddress.fullName,
            shippingAddresses: [{
              _type: 'address',
              name: recentPaidOrder.shippingAddress.name || recentPaidOrder.shippingAddress.fullName,
              line1: recentPaidOrder.shippingAddress.line1 || recentPaidOrder.shippingAddress.address1,
              line2: recentPaidOrder.shippingAddress.line2 || recentPaidOrder.shippingAddress.address2,
              city: recentPaidOrder.shippingAddress.city,
              state: recentPaidOrder.shippingAddress.state,
              postalCode: recentPaidOrder.shippingAddress.postalCode || recentPaidOrder.shippingAddress.zipCode,
              country: recentPaidOrder.shippingAddress.country || 'US',
              isDefault: true
            }]
          })
        };

        transaction.create(userData);
      }

      // Get the user document after creation/update
      const userDoc = await sanityClientWrite.fetch(
        `*[_type == "user" && email == $email][0]{_id}`,
        { email }
      );

      if (userDoc) {
        // Link all guest orders to the user
        const guestOrders = await sanityClientWrite.fetch(
          `*[_type == "order" && customerEmail == $email && !defined(user)]{_id}`,
          { email }
        );

        // Add order updates to transaction
        guestOrders.forEach((order: any) => {
          transaction.patch(order._id, {
            set: { 
              user: { _type: 'reference', _ref: userDoc._id },
              // Ensure order has all necessary fields
              customerEmail: email,
              updatedAt: new Date().toISOString()
            }
          });
        });
      }

      // Commit all changes in a single transaction
      await transaction.commit();

      return NextResponse.json({ 
        message: 'Account activated successfully! You can now log in.',
        success: true 
      });
    } catch (error) {
      console.error('Error during account activation:', error);
      return NextResponse.json(
        { message: 'Failed to activate account. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing activation request:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 