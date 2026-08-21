const express = require('express');
const Product = require('../models/Product');
const Question = require('../models/Question');
const Review = require('../models/Review');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { setPublicCache } = require('../utils/cache');

const router = express.Router();

const PRODUCT_LIST_FIELDS = 'name price originalPrice discount category images stock rating numberOfReviews createdAt';

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    let filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'specifications.brand': { $regex: search, $options: 'i' } },
        { 'specifications.model': { $regex: search, $options: 'i' } },
        { 'specifications.color': { $regex: search, $options: 'i' } },
        { 'specifications.material': { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .select(PRODUCT_LIST_FIELDS)
      .sort(sort === 'price-low' ? { price: 1 } : sort === 'price-high' ? { price: -1 } : { createdAt: -1 })
      .populate('seller', 'name')
      .lean();

    setPublicCache(res);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product with reviews and questions in one request
router.get('/:id/details', async (req, res) => {
  try {
    const [product, reviews, questions] = await Promise.all([
      Product.findById(req.params.id)
        .populate('seller', 'name email')
        .lean(),
      Review.find({ product: req.params.id })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .lean(),
      Question.find({ product: req.params.id })
        .populate('user', 'name')
        .populate('answeredBy', 'name')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    setPublicCache(res);
    res.json({ product, reviews, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email')
      .lean();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    setPublicCache(res);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product (Admin/Seller only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      category,
      images,
      stock,
      specifications
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      discount: discount || 0,
      category,
      images,
      stock,
      specifications,
      seller: req.user.id
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (Admin/Seller only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (Admin/Seller only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
