const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name'],
    trim: true,
    unique: true,
    maxlength: 100
  },
  subcategories: [{
    type: String,
    trim: true
  }],
  icon: {
    type: String,
    default: '📁'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);