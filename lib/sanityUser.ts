import { sanityClientWrite as client } from '@/lib/sanityClient';

export async function fetchUserOrders(email: string) {
  console.log('🔍 Fetching orders for email:', email);
  const orders = await client.fetch(
    `*[_type == "order" && (customerEmail == $email || user->email == $email)]|order(createdAt desc){
      _id, orderNumber, createdAt, totalAmount, paymentStatus, items[]{name, quantity, price, image}, shippingAddress
    }`,
    { email }
  );
  console.log('📦 Fetched orders:', orders.map(order => ({
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.paymentStatus,
    createdAt: order.createdAt
  })));
  return orders;
}

// Fetch user profile by email
export async function fetchUserProfile(email: string) {
  const user = await client.fetch(
    `*[_type == "user" && email == $email][0]{
      _id,
      email,
      name,
      image,
      emailVerified,
      accountStatus,
      shippingAddresses
    }`,
    { email }
  );
  // Check for linked Google account
  const googleAccount = await client.fetch(
    `*[_type == "account" && provider == "google" && user->email == $email][0]`,
    { email }
  );
  const linkedAccounts = ["email"];
  if (googleAccount) linkedAccounts.push("google");
  return { ...user, linkedAccounts };
}

// Fetch user shipping addresses by email
export async function fetchUserAddresses(email: string) {
  const addresses = await client.fetch(
    `*[_type == "user" && email == $email][0].shippingAddresses`,
    { email }
  );
  console.log('🔎 fetchUserAddresses:', { email, addresses });
  return addresses || [];
} 