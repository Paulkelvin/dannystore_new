"use client";
import useSWR, { mutate } from "swr";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { urlFor } from '@/lib/sanityClient';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function OrderHistory({ userEmail }: { userEmail: string }) {
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    userEmail ? `/api/orders?email=${encodeURIComponent(userEmail)}` : null,
    fetcher
  );
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleRefresh = () => {
    revalidate();
  };

  // Add filter state
  const [statusFilter, setStatusFilter] = React.useState('all');

  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div>Error loading orders.</div>;

  // Show all orders, sorted by date
  const orders = data?.orders || [];

  // Group orders by orderNumber
  const ordersByNumber = orders.reduce((acc: Record<string, any[]>, order: any) => {
    if (!acc[order.orderNumber]) acc[order.orderNumber] = [];
    acc[order.orderNumber].push(order);
    return acc;
  }, {});

  // Flatten, hiding obsolete if a paid exists for that order number
  let filteredOrders: any[] = [];
  Object.values(ordersByNumber).forEach((group: any[]) => {
    const hasPaid = group.some(order => order.paymentStatus === 'paid');
    if (hasPaid) {
      filteredOrders.push(...group.filter(order => order.paymentStatus !== 'obsolete'));
    } else {
      filteredOrders.push(...group);
    }
  });

  // Apply status filter
  if (statusFilter !== 'all') {
    filteredOrders = filteredOrders.filter(order => order.paymentStatus === statusFilter);
  }

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Order History</h2>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
        <label className="text-sm font-medium text-gray-700">
          Filter:
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="ml-2 px-2 py-1 border border-gray-300 rounded"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="obsolete">Obsolete</option>
          </select>
        </label>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleOrderDetails(order._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.paymentStatus === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : order.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={e => { e.stopPropagation(); toggleOrderDetails(order._id); }}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                        tabIndex={0}
                      >
                        {expandedOrderId === order._id ? (
                          <>
                            Hide Details
                            <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            View Details
                            <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedOrderId === order._id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className={`space-y-4 transition-all duration-300 ease-in-out ${expandedOrderId === order._id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Items</h3>
                            <div className="space-y-2">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-3">
                                    {item.image && (
                                      <img
                                        src={item.image?.asset?._ref ? urlFor(item.image).width(200).url() : item.image?.asset?.url || item.image}
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded"
                                      />
                                    )}
                                    <div>
                                      <p className="font-medium text-gray-900">{item.name}</p>
                                      <p className="text-gray-500">
                                        {item.color && <span>Color: {item.color}</span>}
                                        {item.size && <span className="ml-2">Size: {item.size}</span>}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-gray-900">Qty: {item.quantity}</p>
                                    <p className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {order.shippingAddress && (
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-2">Shipping Address</h3>
                              <div className="text-sm text-gray-600">
                                {order.shippingAddress.name}<br />
                                {order.shippingAddress.line1}<br />
                                {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                                {order.shippingAddress.country}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                              Order placed on {new Date(order.createdAt).toLocaleString()}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">Total Amount</p>
                              <p className="text-lg font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 