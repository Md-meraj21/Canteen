import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import '../styles/Orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders-container">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-number">{order.orderNumber}</span>
                <span className={`status ${order.orderStatus}`}>{order.orderStatus}</span>
              </div>

              <div className="order-details">
                <div className="detail">
                  <label>Date:</label>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail">
                  <label>Total Amount:</label>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="detail">
                  <label>Payment Method:</label>
                  <span>{order.paymentMethod}</span>
                </div>
              </div>

              <div className="order-items">
                <h4>Items:</h4>
                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.product ? item.product.name : 'Unknown Product'} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-address">
                <h4>Shipping To:</h4>
                <p>
                  {order.shippingAddress.street}, {order.shippingAddress.city},<br />
                  {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
