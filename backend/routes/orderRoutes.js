const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendAdminNotification } = require('../utils/email');

const router = express.Router();

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shippingCost, tax } = req.body;

    const orderNumber = 'ORD-' + Date.now();
    const totalAmount = subtotal + shippingCost + tax;

    const order = new Order({
      orderNumber,
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      totalAmount
    });

    await order.save();

    const customer = await User.findById(req.user.id).select('name email phone');
    sendAdminNotification({
      subject: `New order received: ${order.orderNumber}`,
      text: [
        `New order ${order.orderNumber} has been placed.`,
        `Customer: ${customer?.name || 'Customer'} (${customer?.email || 'No email'})`,
        `Phone: ${customer?.phone || shippingAddress?.phone || 'Not provided'}`,
        `Amount: Rs ${Number(totalAmount || 0).toFixed(2)}`,
        `Payment: ${paymentMethod}`,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
          <h2>New order received</h2>
          <p><strong>Order:</strong> ${order.orderNumber}</p>
          <p><strong>Customer:</strong> ${customer?.name || 'Customer'} (${customer?.email || 'No email'})</p>
          <p><strong>Phone:</strong> ${customer?.phone || shippingAddress?.phone || 'Not provided'}</p>
          <p><strong>Amount:</strong> Rs ${Number(totalAmount || 0).toFixed(2)}</p>
          <p><strong>Payment:</strong> ${paymentMethod}</p>
          <p>Open the admin dashboard to confirm and process this order.</p>
        </div>
      `,
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (Admin only)
router.get('/admin/all', adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logged-in user's orders only
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    const user = await require('../models/User').findById(req.user.id);
    if (order.user._id.toString() !== req.user.id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const validOrderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// Update order status (Admin only)
router.put('/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!validOrderStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate('items.product')
    .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
