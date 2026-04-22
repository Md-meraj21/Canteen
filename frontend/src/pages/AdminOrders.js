import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../services/api';
import '../styles/AdminOrders.css';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAllOrders();
    // Poll for new orders every 5 seconds
    const interval = setInterval(fetchAllOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      console.log('Orders fetched:', response.data);
      setOrders(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
      console.error('Error fetching orders:', err);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('Updating order:', orderId, 'to status:', newStatus);
      const response = await ordersAPI.updateStatus(orderId, newStatus);
      console.log('Update response:', response);
      alert(`Order status updated to ${newStatus}`);
      fetchAllOrders();
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
      console.error('Error updating status:', err);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-orders">
      <h2>📊 Retailer Dashboard - All Orders</h2>
      
      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{orders.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-value pending">{orders.filter(o => o.orderStatus === 'pending').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Confirmed</span>
          <span className="stat-value confirmed">{orders.filter(o => o.orderStatus === 'confirmed').length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Delivered</span>
          <span className="stat-value delivered">{orders.filter(o => o.orderStatus === 'delivered').length}</span>
        </div>
      </div>

      <div className="filter-buttons">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Orders
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          ⏳ Pending
        </button>
        <button 
          className={filter === 'confirmed' ? 'active' : ''} 
          onClick={() => setFilter('confirmed')}
        >
          ✅ Confirmed
        </button>
        <button 
          className={filter === 'shipped' ? 'active' : ''} 
          onClick={() => setFilter('shipped')}
        >
          🚚 Shipped
        </button>
        <button 
          className={filter === 'delivered' ? 'active' : ''} 
          onClick={() => setFilter('delivered')}
        >
          📦 Delivered
        </button>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order._id} className={`order-row ${order.orderStatus}`}>
                  <td className="order-id">{order.orderNumber}</td>
                  <td>{order.user?.name || 'Guest'}</td>
                  <td>
                    <div className="products-list">
                      {order.items && order.items.map((item, idx) => (
                        <span key={idx} className="product-item">
                          {item.product?.name || 'Product'} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="amount">₹{order.totalAmount?.toFixed(2) || '0'}</td>
                  <td>
                    <span className={`status-badge ${order.orderStatus}`}>
                      {order.orderStatus?.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      {order.orderStatus === 'pending' && (
                        <button 
                          className="btn-confirm"
                          onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                        >
                          ✅ Confirm
                        </button>
                      )}
                      {order.orderStatus === 'confirmed' && (
                        <button 
                          className="btn-ship"
                          onClick={() => handleStatusUpdate(order._id, 'shipped')}
                        >
                          🚚 Ship
                        </button>
                      )}
                      {order.orderStatus === 'shipped' && (
                        <button 
                          className="btn-deliver"
                          onClick={() => handleStatusUpdate(order._id, 'delivered')}
                        >
                          📦 Deliver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;
