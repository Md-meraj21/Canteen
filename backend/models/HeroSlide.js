const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide slide title'],
      trim: true,
      maxlength: 80,
    },
    subtitle: {
      type: String,
      required: [true, 'Please provide slide subtitle'],
      trim: true,
      maxlength: 160,
    },
    ctaText: {
      type: String,
      default: 'Shop Now',
      trim: true,
      maxlength: 32,
    },
    ctaLink: {
      type: String,
      default: '/',
      trim: true,
    },
    badge: {
      type: String,
      default: 'Canteen Specials',
      trim: true,
      maxlength: 40,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    gradientFrom: {
      type: String,
      default: '#064e3b',
      trim: true,
    },
    gradientTo: {
      type: String,
      default: '#020617',
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
