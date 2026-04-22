const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Please provide description'],
    maxlength: 2000
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Please provide category'],
    enum: [
      'Phones',
      'Laptops',
      'Electronics',
      'Groceries',
      'Clothing',
      'Books',
      'Home & Kitchen',
      'Sports',
      'Beauty',
      'Other'
    ]
  },
  images: [{
    type: String,
    required: true
  }],
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  specifications: {
    brand: String,
    model: String,
    warranty: String,
    color: String,
    material: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
