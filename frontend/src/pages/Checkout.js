import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../context/store';
import { useAuthStore } from '../context/store';
import { ordersAPI } from '../services/api';
import '../styles/Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore();
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    paymentMethod: 'credit-card',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Cart is empty');
      return;
    }

    try {
      setLoading(true);
      const subtotal = totalPrice;
      const tax = subtotal * 0.18;
      const shippingCost = 0;

      const orderData = {
        items: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod,
        subtotal,
        shippingCost,
        tax,
        totalAmount: subtotal + shippingCost + tax
      };

      const response = await ordersAPI.create(orderData);
      clearCart();
      navigate('/order-confirmation', { state: { order: response.data.order } });
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="checkout-empty">
        <h2>❌ Login Required</h2>
        <p>You need to log in before you can purchase items.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>No items in cart</h2>
        <button onClick={() => navigate('/')}>Return to Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section>
            <h2>Shipping Address</h2>
            <input
              type="text"
              name="street"
              placeholder="Street Address"
              value={formData.street}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="zipCode"
              placeholder="ZIP Code"
              value={formData.zipCode}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </section>

          <section>
            <h2>Payment Method</h2>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="credit-card"
                checked={formData.paymentMethod === 'credit-card'}
                onChange={handleChange}
              />
              Credit Card
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="debit-card"
                checked={formData.paymentMethod === 'debit-card'}
                onChange={handleChange}
              />
              Debit Card
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={formData.paymentMethod === 'upi'}
                onChange={handleChange}
              />
              UPI
            </label>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={formData.paymentMethod === 'cod'}
                onChange={handleChange}
              />
              Cash on Delivery
            </label>
          </section>

          <button type="submit" className="btn-place-order" disabled={loading}>
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>

        <div className="order-summary">
          <h2>Order Summary</h2>
          {items.map(item => (
            <div key={item.product._id} className="summary-item">
              <span>{item.product.name} x {item.quantity}</span>
              <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (18%):</span>
            <span>₹{(totalPrice * 0.18).toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>₹{(totalPrice * 1.18).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
