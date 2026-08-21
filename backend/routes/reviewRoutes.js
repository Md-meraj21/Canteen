const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/auth');
const { setPublicCache } = require('../utils/cache');

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    setPublicCache(res);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating || !title?.trim()) {
      return res.status(400).json({ error: 'Product, rating, and title are required' });
    }

    const existingReview = await Review.findOne({ product: productId, user: req.user.id });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    const review = new Review({
      product: productId,
      user: req.user.id,
      rating,
      title,
      comment
    });

    await review.save();
    await updateProductRating(productId);
    await review.populate('user', 'name avatar');
    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update review
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(review, req.body);
    await review.save();
    await updateProductRating(review.product);

    res.json({ message: 'Review updated', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete review
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const productId = review.product;
    await Review.deleteOne({ _id: req.params.id });
    await updateProductRating(productId);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const updateProductRating = async (productId) => {
  const productObjectId = new mongoose.Types.ObjectId(productId);
  const stats = await Review.aggregate([
    { $match: { product: productObjectId } },
    {
      $group: {
        _id: '$product',
        rating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);

  const ratingData = stats[0] || { rating: 0, numberOfReviews: 0 };
  await Product.findByIdAndUpdate(productId, {
    rating: Number(Number(ratingData.rating || 0).toFixed(1)),
    numberOfReviews: ratingData.numberOfReviews || 0
  });
};

module.exports = router;
