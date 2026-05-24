import React, { useEffect, useState } from 'react';
import { Alert, Button, Chip, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ordersAPI } from '../services/api';
import { money, page, panel, statusTone } from '../utils/ui';

const filters = ['all', 'pending', 'confirmed', 'shipped', 'delivered'];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchAllOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      setError(`Failed to load orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    const interval = setInterval(fetchAllOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      fetchAllOrders();
    } catch (err) {
      setError(`Failed to update order status: ${err.message}`);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((order) => order.orderStatus === filter);
  const stats = {
    total: orders.length,
    pending: orders.filter((order) => order.orderStatus === 'pending').length,
    confirmed: orders.filter((order) => order.orderStatus === 'confirmed').length,
    delivered: orders.filter((order) => order.orderStatus === 'delivered').length,
  };

  if (loading) {
    return (
      <div className={`${page} grid min-h-[40vh] place-items-center`}>
        <CircularProgress color="success" />
      </div>
    );
  }

  return (
    <div className={page}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Retailer Dashboard</p>
          <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">All Orders</h1>
        </div>
        <Button variant="outlined" color="success" onClick={fetchAllOrders}>Refresh</Button>
      </div>

      {error && <Alert severity="error" className="!mt-5">{error}</Alert>}

      <section className="mt-3 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-4 lg:grid-cols-4">
        {[
          ['Total Orders', stats.total],
          ['Pending', stats.pending],
          ['Confirmed', stats.confirmed],
          ['Delivered', stats.delivered],
        ].map(([label, value]) => (
          <div key={label} className={`${panel} p-3 sm:p-5`}>
            <p className="text-sm text-slate-500">{label}</p>
            <strong className="mt-1 block text-xl text-slate-950 sm:mt-2 sm:text-3xl">{value}</strong>
          </div>
        ))}
      </section>

      <div className="no-scrollbar mt-3 overflow-x-auto sm:mt-6">
        <ToggleButtonGroup color="success" value={filter} exclusive onChange={(_, value) => value && setFilter(value)}>
          {filters.map((item) => (
            <ToggleButton key={item} value={item}>{item}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </div>

      <section className={`${panel} mt-3 overflow-hidden sm:mt-6`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-4 py-4 font-bold">{order.orderNumber}</td>
                  <td className="px-4 py-4">{order.user?.name || 'Guest'}</td>
                  <td className="px-4 py-4">
                    <div className="grid gap-1">
                      {order.items?.map((item, index) => (
                        <span key={index}>{item.product?.name || 'Product'} x{item.quantity}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 font-bold">{money(order.totalAmount)}</td>
                  <td className="px-4 py-4"><Chip label={order.orderStatus} color={statusTone(order.orderStatus)} size="small" /></td>
                  <td className="px-4 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    {order.orderStatus === 'pending' && (
                      <Button size="small" color="success" onClick={() => handleStatusUpdate(order._id, 'confirmed')}>Confirm</Button>
                    )}
                    {order.orderStatus === 'confirmed' && (
                      <Button size="small" color="success" onClick={() => handleStatusUpdate(order._id, 'shipped')}>Ship</Button>
                    )}
                    {order.orderStatus === 'shipped' && (
                      <Button size="small" color="success" onClick={() => handleStatusUpdate(order._id, 'delivered')}>Deliver</Button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-4 py-10 text-center text-slate-500">No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminOrders;
