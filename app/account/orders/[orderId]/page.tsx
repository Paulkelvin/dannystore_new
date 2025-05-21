import { getServerSession } from 'next-auth';
import { sanityClientPublic } from '@/lib/sanityClient';
import { redirect } from 'next/navigation';

// Add Order interface for type safety
interface Order {
  orderNumber: string;
  createdAt: string;
  paymentStatus: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: any;
  }>;
  shippingAddress?: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export default async function OrderDetailsPage({ params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const session = await getServerSession();
  console.log('🟦 OrderDetailsPage session:', session);
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Fetch the user document to get userId
  let userId = undefined;
  try {
    const user = await sanityClientPublic.fetch(
      `*[_type == "user" && email == $email][0]{_id, email}`,
      { email: session.user.email }
    );
    if (user?._id) userId = user._id;
  } catch (err) {
    console.error('OrderDetailsPage: Error fetching userId', err);
  }

  // Fetch the order using all possible user associations
  let order: Order | null = null;
  try {
    order = await sanityClientPublic.fetch(
      `*[_type == "order" && _id == $id && (
        customerEmail == $email || user->email == $email${userId ? ' || userId == $userId' : ''}
      )][0]{
        orderNumber, createdAt, paymentStatus, totalAmount, items[]{name, quantity, price, image}, shippingAddress
      }`,
      { id: orderId, email: session.user.email, userId }
    );
    console.log('OrderDetailsPage: fetched order:', order);
  } catch (err) {
    console.error('OrderDetailsPage: Error fetching order', err);
  }

  if (!order) {
    return <div className="max-w-2xl mx-auto mt-16 p-6 bg-white rounded shadow text-center text-red-600">Order not found or you do not have access.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2">Order #{order.orderNumber}</h1>
      <div className="mb-4 text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
      <div className="mb-4">
        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.paymentStatus}</span>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2">Items</h2>
      <ul className="divide-y divide-gray-200 mb-6">
        {order.items && order.items.length > 0 ? order.items.map((item: any, idx: number) => (
          <li key={idx} className="py-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {item.image && <img src={item.image?.asset?._ref ? `/api/sanity/image/${item.image.asset._ref}` : item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />}
              <span>{item.name} x {item.quantity}</span>
            </div>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        )) : <li className="py-2 text-gray-500">No items found for this order.</li>}
      </ul>
      <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
      <div className="mb-6 text-gray-700">
        {order.shippingAddress?.name}<br />
        {order.shippingAddress?.line1}<br />
        {order.shippingAddress?.line2 && <>{order.shippingAddress.line2}<br /></>}
        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
        {order.shippingAddress?.country}
      </div>
      <div className="text-right text-xl font-bold">Total: ${order.totalAmount.toFixed(2)}</div>
    </div>
  );
} 