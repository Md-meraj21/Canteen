const express = require('express');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authMiddleware: protect, adminMiddleware: admin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/categories
router.get('/', getAllCategories);

// @route   POST /api/categories
router.post('/', protect, admin, createCategory);

// @route   PUT /api/categories/:id
router.put('/:id', protect, admin, updateCategory);

// @route   DELETE /api/categories/:id
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
