import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Divider, FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material';
import { useAuthStore, useCartStore } from '../context/store';
import { ordersAPI } from '../services/api';
import { money, page, panel } from '../utils/ui';

function getSavedLocation() {
  try {
    const savedDetails = localStorage.getItem('selectedLocationDetails');
    if (savedDetails) return JSON.parse(savedDetails);

    const savedLabel = localStorage.getItem('selectedLocation');
    if (!savedLabel) return null;
    const [city = '', state = '', country = ''] = savedLabel.split(',').map((item) => item.trim());
    return { label: savedLabel, city, state, country };
  } catch {
    return null;
  }
}

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore();
  const [savedLocation] = useState(getSavedLocation);
  const [formData, setFormData] = useState(() => ({
    street: savedLocation?.street || '',
    city: savedLocation?.city || '',
    state: savedLocation?.state || '',
    zipCode: savedLocation?.zipCode || '',
    country: savedLocation?.country || '',
    phone: '',
    paymentMethod: 'credit-card',
  }));
  const [loading, setLoading] = useState(false);
  const tax = totalPrice * 0.18;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const applySavedLocation = () => {
    if (!savedLocation) return;
    setFormData((previous) => ({
      ...previous,
      street: savedLocation.street || previous.street,
      city: savedLocation.city || previous.city,
      state: savedLocation.state || previous.state,
      zipCode: savedLocation.zipCode || previous.zipCode,
      country: savedLocation.country || previous.country,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (items.length === 0) return;

    try {
      setLoading(true);
      const orderData = {
        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod,
        subtotal: totalPrice,
        shippingCost: 0,
        tax,
        totalAmount: totalPrice + tax,
      };

      const response = await ordersAPI.create(orderData);
      clearCart();
      navigate('/order-confirmation', { state: { order: response.data.order } });
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`${page} grid min-h-[45vh] place-items-center`}>
        <div className={`${panel} p-5 text-center sm:p-8`}>
          <h1 className="text-2xl font-bold text-slate-950">Login Required</h1>
          <p className="mt-2 text-slate-500">You need to log in before purchasing items.</p>
          <Button variant="contained" color="success" className="!mt-5" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${page} grid min-h-[45vh] place-items-center`}>
        <div className={`${panel} p-5 text-center sm:p-8`}>
          <h1 className="text-2xl font-bold text-slate-950">No items in cart</h1>
          <Button variant="contained" color="success" className="!mt-5" onClick={() => navigate('/')}>
            Return to Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={page}>
      <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Checkout</h1>

      <div className="mt-3 grid gap-3 sm:mt-6 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={handleSubmit} className={`${panel} grid gap-4 p-4 sm:gap-6 sm:p-5`}>
          <section>
            <h2 className="text-xl font-bold text-slate-950">Shipping Address</h2>
            {savedLocation ? (
              <Alert
                severity="info"
                className="!mt-4"
                action={<Button color="inherit" size="small" onClick={applySavedLocation}>Apply</Button>}
              >
                Saved location: {savedLocation.label}
              </Alert>
            ) : (
              <Alert severity="info" className="!mt-4">No saved location found. Enter address manually.</Alert>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
              <TextField label="Street Address" name="street" value={formData.street} onChange={handleChange} required fullWidth className="sm:col-span-2" />
              <TextField label="City" name="city" value={formData.city} onChange={handleChange} required fullWidth />
              <TextField label="State" name="state" value={formData.state} onChange={handleChange} required fullWidth />
              <TextField label="ZIP Code" name="zipCode" value={formData.zipCode} onChange={handleChange} required fullWidth />
              <TextField label="Country" name="country" value={formData.country} onChange={handleChange} required fullWidth />
              <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required fullWidth className="sm:col-span-2" />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-950">Payment Method</h2>
            <RadioGroup name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="!mt-3">
              <FormControlLabel value="credit-card" control={<Radio color="success" />} label="Credit Card" />
              <FormControlLabel value="debit-card" control={<Radio color="success" />} label="Debit Card" />
              <FormControlLabel value="upi" control={<Radio color="success" />} label="UPI" />
              <FormControlLabel value="cod" control={<Radio color="success" />} label="Cash on Delivery" />
            </RadioGroup>
          </section>

          <Button type="submit" variant="contained" color="success" size="large" disabled={loading}>
            {loading ? 'Processing...' : 'Place Order'}
          </Button>
        </form>

        <aside className={`${panel} h-max p-4 sm:p-5`}>
          <h2 className="text-xl font-bold text-slate-950">Order Summary</h2>
          <div className="mt-5 grid gap-3">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between gap-4 text-sm">
                <span>{item.product.name} x {item.quantity}</span>
                <strong>{money(item.product.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <Divider className="!my-4" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{money(totalPrice)}</strong></div>
            <div className="flex justify-between"><span>Tax (18%)</span><strong>{money(tax)}</strong></div>
          </div>
          <Divider className="!my-4" />
          <div className="flex justify-between text-lg font-black"><span>Total</span><span>{money(totalPrice + tax)}</span></div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;
