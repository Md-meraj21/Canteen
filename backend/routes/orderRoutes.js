const express = require('express');
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/auth');

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
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's orders (for customer)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const user = await require('../models/User').findById(req.user.id);
    if (user.role === 'admin') {
      // Admin gets all orders
      const orders = await Order.find()
        .populate('items.product')
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });
      return res.json(orders);
    }
    // Regular customer gets only their orders
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

// Update order status (Admin only)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Verify user is admin
    const user = await require('../models/User').findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can update order status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status, updatedAt: Date.now() },
      { new: true }
    )
    .populate('items.product')
    .populate('user', 'name email phone');

    res.json({ message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
