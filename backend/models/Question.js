const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  answer: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  answeredBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  answeredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

questionSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);
