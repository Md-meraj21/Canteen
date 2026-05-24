import React, { useEffect, useState } from 'react';
import { Chip, CircularProgress } from '@mui/material';
import { ordersAPI } from '../services/api';
import { money, page, panel, statusTone } from '../utils/ui';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMine();
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    window.addEventListener('focus', fetchOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', fetchOrders);
    };
  }, []);

  if (loading) {
    return (
      <div className={`${page} grid min-h-[40vh] place-items-center`}>
        <CircularProgress color="success" />
      </div>
    );
  }

  return (
    <div className={page}>
      <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">My Orders</h1>

      {orders.length === 0 ? (
        <div className={`${panel} mt-3 p-5 text-center text-slate-500 sm:mt-6 sm:p-8`}>You have not placed any orders yet.</div>
      ) : (
        <div className="mt-3 grid gap-3 sm:mt-6 sm:gap-5">
          {orders.map((order) => (
            <article key={order._id} className={`${panel} p-4 sm:p-5`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Order Number</p>
                  <h2 className="text-lg font-bold text-slate-950">{order.orderNumber}</h2>
                </div>
                <Chip label={order.orderStatus} color={statusTone(order.orderStatus)} className="!w-max !font-bold" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-md bg-slate-50 p-3 text-sm sm:mt-5 sm:gap-4 sm:bg-transparent sm:p-0">
                <div><p className="text-xs uppercase text-slate-500">Date</p><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></div>
                <div><p className="text-xs uppercase text-slate-500">Total</p><strong>{money(order.totalAmount)}</strong></div>
                <div><p className="text-xs uppercase text-slate-500">Payment</p><strong>{order.paymentMethod}</strong></div>
              </div>

              <div className="mt-4 rounded-md bg-slate-50 p-3 sm:mt-5 sm:p-4">
                <h3 className="font-bold text-slate-950">Items</h3>
                <ul className="mt-2 grid gap-1 text-sm text-slate-600">
                  {order.items.map((item, index) => (
                    <li key={index}>{item.product ? item.product.name : 'Unknown Product'} x {item.quantity}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                <strong className="text-slate-950">Shipping To: </strong>
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
