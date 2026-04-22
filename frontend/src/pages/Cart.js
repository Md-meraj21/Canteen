import React from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../context/store';
import '../styles/Cart.css';

function Cart() {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn-continue">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>

      <div className="cart-content">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.product._id} className="cart-item">
              <img src={item.product.images[0]} alt={item.product.name} />
              <div className="item-details">
                <h3>{item.product.name}</h3>
                <p>₹{item.product.price}</p>
              </div>
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>+</button>
              </div>
              <div className="item-price">
                ₹{(item.product.price * item.quantity).toFixed(2)}
              </div>
              <button className="remove-btn" onClick={() => removeItem(item.product._id)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>₹0 (FREE)</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>₹{(totalPrice * 0.18).toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total:</span>
            <span>₹{(totalPrice * 1.18).toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="btn-checkout">
            Proceed to Checkout
          </Link>
          <button className="btn-continue" onClick={() => window.location.href = '/'}>
            Continue Shopping
          </button>
          <button className="btn-clear" onClick={clearCart}>
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
