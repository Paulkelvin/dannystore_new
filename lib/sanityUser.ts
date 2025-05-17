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