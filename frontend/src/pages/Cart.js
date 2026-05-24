import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Divider, IconButton } from '@mui/material';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { useCartStore } from '../context/store';
import { money, page, panel } from '../utils/ui';

function Cart() {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCartStore();
  const tax = totalPrice * 0.18;

  if (items.length === 0) {
    return (
      <div className={`${page} grid min-h-[50vh] place-items-center`}>
        <div className={`${panel} max-w-md p-5 text-center sm:p-8`}>
          <h1 className="text-2xl font-bold text-slate-950">Your cart is empty</h1>
          <p className="mt-2 text-slate-500">Add products to your cart before checkout.</p>
          <Button component={Link} to="/" variant="contained" color="success" className="!mt-6">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={page}>
      <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">Shopping Cart</h1>

      <div className="mt-3 grid gap-3 sm:mt-6 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="grid gap-3 sm:gap-4">
          {items.map((item) => (
            <article key={item.product._id} className={`${panel} grid grid-cols-[72px_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[96px_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:p-4`}>
              <img
                src={item.product.images?.[0]}
                alt={item.product.name}
                className="h-[72px] w-[72px] rounded-md bg-slate-100 object-cover sm:h-24 sm:w-24"
              />
              <div className="min-w-0">
                <h2 className="font-bold text-slate-950">{item.product.name}</h2>
                <p className="text-sm text-slate-500">{money(item.product.price)}</p>
                <div className="mt-3 flex w-max items-center rounded-md border border-slate-200">
                  <IconButton size="small" onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}>
                    <FaMinus className="text-xs" />
                  </IconButton>
                  <span className="min-w-10 text-center text-sm font-bold">{item.quantity}</span>
                  <IconButton size="small" onClick={() => updateQuantity(item.product._id, item.quantity + 1)}>
                    <FaPlus className="text-xs" />
                  </IconButton>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:block sm:text-right">
                <p className="text-lg font-black text-slate-950">{money(item.product.price * item.quantity)}</p>
                <Button
                  color="error"
                  size="small"
                  startIcon={<FaTrash />}
                  onClick={() => removeItem(item.product._id)}
                  className="sm:!mt-3"
                >
                  Remove
                </Button>
              </div>
            </article>
          ))}
        </section>

        <aside className={`${panel} h-max p-4 sm:p-5`}>
          <h2 className="text-xl font-bold text-slate-950">Order Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{money(totalPrice)}</strong></div>
            <div className="flex justify-between"><span>Shipping</span><strong>Free</strong></div>
            <div className="flex justify-between"><span>Tax</span><strong>{money(tax)}</strong></div>
          </div>
          <Divider className="!my-4" />
          <div className="flex justify-between text-lg font-black">
            <span>Total</span>
            <span>{money(totalPrice + tax)}</span>
          </div>
          <Button component={Link} to="/checkout" fullWidth variant="contained" color="success" className="!mt-5">
            Proceed to Checkout
          </Button>
          <Button component={Link} to="/" fullWidth variant="outlined" color="success" className="!mt-3">
            Continue Shopping
          </Button>
          <Button fullWidth color="error" className="!mt-2" onClick={clearCart}>
            Clear Cart
          </Button>
        </aside>
      </div>
    </div>
  );
}

export default Cart;
