import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/OrderConfirmation.css';

function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="confirmation-container">
        <h2>No order found</h2>
        <button onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <h1>✓ Order Confirmed!</h1>
        <p>Thank you for your order.</p>

        <div className="confirmation-details">
          <div className="detail-row">
            <span>Order Number:</span>
            <span className="order-number">{order.orderNumber}</span>
          </div>
          <div className="detail-row">
            <span>Total Amount:</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="detail-row">
            <span>Payment Method:</span>
            <span>{order.paymentMethod}</span>
          </div>
          <div className="detail-row">
            <span>Status:</span>
            <span className="status-badge">{order.orderStatus}</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ol>
            <li>We'll confirm your payment shortly</li>
            <li>Your order will be processed and packed</li>
            <li>You'll receive a tracking number via email</li>
            <li>Product will be delivered to your address</li>
          </ol>
        </div>

        <div className="confirmation-actions">
          <button onClick={() => navigate('/orders')} className="btn-track">
            Track Your Order
          </button>
          <button onClick={() => navigate('/')} className="btn-shop">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
