const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const categories = [
  {
    name: 'Biscuits, Drinks & Package',
    subcategories: ['Biscuits', 'Soft Drinks'],
    icon: '🍪'
  },
  {
    name: 'Fruits & Vegetables',
    subcategories: ['Fresh Fruits', 'Vegetables'],
    icon: '🥕'
  },
  {
    name: 'Cooking Essentials',
    subcategories: ['Oil', 'Spices'],
    icon: '🍳'
  },
  {
    name: 'Dairy & Bakery',
    subcategories: ['Milk', 'Bread'],
    icon: '🥛'
  },
  {
    name: 'Personal Care',
    subcategories: ['Soap', 'Shampoo'],
    icon: '🧴'
  },
  {
    name: 'Beauty',
    subcategories: ['Cream'],
    icon: '💄'
  },
  {
    name: 'Mom & Baby Care',
    subcategories: ['Baby Food'],
    icon: '👶'
  },
  {
    name: 'Home',
    subcategories: ['Cleaning'],
    icon: '🏠'
  }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    console.log('Cleared existing categories');

    await Category.insertMany(categories);
    console.log('Categories seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();