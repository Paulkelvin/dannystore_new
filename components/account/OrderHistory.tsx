import React, { useEffect } from 'react';
import useSWR from 'swr';

export default function OrderHistory({ userEmail }: { userEmail: string }) {
  const { data, error, isLoading } = useSWR(
    userEmail ? ["orders", userEmail] : null,
    () => fetchUserOrders(userEmail)
  );

  // Add logging for debugging
  useEffect(() => {
    if (data) {
      console.log('📦 OrderHistory received data:', {
        totalOrders: data.length,
        orders: data.map(order => ({
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.paymentStatus,
          createdAt: order.createdAt
        }))
      });
    }
  }, [data]);

  if (isLoading) return <div>Loading orders...</div>;
  if (error) {
    console.error('❌ Error loading orders:', error);
    return <div>Error loading orders.</div>;
  }

  // Group orders by orderNumber, prefer 'paid', else show latest
  const groupedOrders = (() => {
    if (!data) return [];
    const map = new Map();
    for (const order of data) {
      const existing = map.get(order.orderNumber);
      if (!existing) {
        map.set(order.orderNumber, order);
      } else {
        // Prefer paid, else latest
        if (order.paymentStatus === 'paid') {
          console.log('🔄 Replacing order in group:', {
            orderNumber: order.orderNumber,
            oldStatus: existing.paymentStatus,
            newStatus: order.paymentStatus
          });
          map.set(order.orderNumber, order);
        } else if (existing.paymentStatus !== 'paid' && new Date(order.createdAt) > new Date(existing.createdAt)) {
          console.log('🔄 Replacing order in group (newer):', {
            orderNumber: order.orderNumber,
            oldStatus: existing.paymentStatus,
            newStatus: order.paymentStatus,
            oldDate: existing.createdAt,
            newDate: order.createdAt
          });
          map.set(order.orderNumber, order);
        }
      }
    }
    const result = Array.from(map.values());
    console.log('📊 Grouped orders:', {
      totalGroups: result.length,
      groups: result.map(order => ({
        orderNumber: order.orderNumber,
        status: order.paymentStatus,
        createdAt: order.createdAt
      }))
    });
    return result;
  })();

  // ... rest of the existing code ...
} 