const express = require('express');
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.get('/admin/all', adminMiddleware, getAllOrders);
router.get('/', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', adminMiddleware, updateOrderStatus);

module.exports = router;
