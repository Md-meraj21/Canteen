import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Chip, Divider } from '@mui/material';
import { money, page, panel, statusTone } from '../utils/ui';

function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className={`${page} grid min-h-[45vh] place-items-center`}>
        <div className={`${panel} p-8 text-center`}>
          <h1 className="text-2xl font-bold text-slate-950">No order found</h1>
          <Button variant="contained" color="success" className="!mt-5" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${page} grid place-items-center`}>
      <section className={`${panel} w-full max-w-2xl p-6 sm:p-8`}>
        <Chip label="Order Confirmed" color="success" className="!font-bold" />
        <h1 className="mt-4 text-3xl font-black text-slate-950">Thank you for your order.</h1>
        <p className="mt-2 text-slate-500">We have received your order and will process it shortly.</p>

        <div className="mt-6 grid gap-3 rounded-lg bg-slate-50 p-4">
          <div className="flex justify-between gap-4"><span>Order Number</span><strong>{order.orderNumber}</strong></div>
          <div className="flex justify-between gap-4"><span>Total Amount</span><strong>{money(order.totalAmount)}</strong></div>
          <div className="flex justify-between gap-4"><span>Payment Method</span><strong>{order.paymentMethod}</strong></div>
          <div className="flex justify-between gap-4">
            <span>Status</span>
            <Chip label={order.orderStatus} color={statusTone(order.orderStatus)} size="small" />
          </div>
        </div>

        <Divider className="!my-6" />

        <h2 className="text-lg font-bold text-slate-950">What happens next?</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>Payment and stock are confirmed.</li>
          <li>Your order is packed for dispatch.</li>
          <li>Tracking details are shared when available.</li>
          <li>The product is delivered to your address.</li>
        </ol>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button variant="contained" color="success" onClick={() => navigate('/orders')}>Track Your Order</Button>
          <Button variant="outlined" color="success" onClick={() => navigate('/')}>Continue Shopping</Button>
        </div>
      </section>
    </div>
  );
}

export default OrderConfirmation;
