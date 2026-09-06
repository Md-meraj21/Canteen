const express = require('express');
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authMiddleware, createReview);
router.put('/:id', authMiddleware, updateReview);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;
