const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

dotenv.config();

let sellerId;

const createSellerAndProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Create a default seller user
    const sellerExists = await User.findOne({ email: 'seller@shopkaro.com' });
    if (sellerExists) {
      sellerId = sellerExists._id;
      console.log('✅ Using existing seller user');
    } else {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash('seller123', salt);
      const seller = await User.create({
        name: 'Shop Karo Store',
        email: 'seller@shopkaro.com',
        phone: '+91-9999999999',
        password: hashedPassword
      });
      sellerId = seller._id;
      console.log('✅ Created seller user');
    }

    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    const demoProducts = [
      // Phones
      { name: 'iPhone 15 Pro', description: 'Latest Apple flagship with A17 Pro chip', price: 99999, category: 'Phones', seller: sellerId, images: ['https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop'], stock: 50, rating: 4.8, numberOfReviews: 245, isActive: true },
      { name: 'Samsung Galaxy S24', description: 'Powerful Android phone with excellent display', price: 79999, category: 'Phones', seller: sellerId, images: ['https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop'], stock: 40, rating: 4.7, numberOfReviews: 198, isActive: true },
      { name: 'OnePlus 12', description: 'Fast and smooth performance with OxygenOS', price: 49999, category: 'Phones', seller: sellerId, images: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop'], stock: 35, rating: 4.6, numberOfReviews: 156, isActive: true },
      { name: 'Xiaomi 14', description: 'Value for money with premium features', price: 44999, category: 'Phones', seller: sellerId, images: ['https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=500&h=500&fit=crop'], stock: 60, rating: 4.5, numberOfReviews: 312, isActive: true },

      // Laptops
      { name: 'MacBook Pro 16', description: 'Powerful laptop with M3 Max chip', price: 199999, category: 'Laptops', seller: sellerId, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop'], stock: 20, rating: 4.9, numberOfReviews: 128, isActive: true },
      { name: 'Dell XPS 15', description: 'Premium Windows laptop with stunning display', price: 149999, category: 'Laptops', seller: sellerId, images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop'], stock: 25, rating: 4.8, numberOfReviews: 95, isActive: true },
      { name: 'Lenovo ThinkPad X1', description: 'Business laptop with excellent keyboard', price: 119999, category: 'Laptops', seller: sellerId, images: ['https://images.unsplash.com/photo-1588872657840-4a91e6f98a19?w=500&h=500&fit=crop'], stock: 30, rating: 4.7, numberOfReviews: 87, isActive: true },
      { name: 'ASUS ROG Gaming Laptop', description: 'High-performance gaming laptop RTX 4090', price: 179999, category: 'Laptops', seller: sellerId, images: ['https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=500&h=500&fit=crop'], stock: 15, rating: 4.8, numberOfReviews: 203, isActive: true },

      // Electronics
      { name: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise cancellation', price: 29999, category: 'Electronics', seller: sellerId, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'], stock: 45, rating: 4.7, numberOfReviews: 512, isActive: true },
      { name: 'Apple iPad Pro', description: 'Versatile tablet with M2 chip', price: 79999, category: 'Electronics', seller: sellerId, images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=500&fit=crop'], stock: 28, rating: 4.8, numberOfReviews: 334, isActive: true },
      { name: 'Samsung 4K Smart TV 55"', description: 'Crystal clear 4K display with smart features', price: 49999, category: 'Electronics', seller: sellerId, images: ['https://images.unsplash.com/photo-1565043666747-69f6646db940?w=500&h=500&fit=crop'], stock: 12, rating: 4.6, numberOfReviews: 189, isActive: true },

      // Groceries
      { name: 'Organic Basmati Rice (5kg)', description: 'Premium quality long grain rice', price: 599, category: 'Groceries', seller: sellerId, images: ['https://images.unsplash.com/photo-1586080876681-8ad6a3ddcd96?w=500&h=500&fit=crop'], stock: 100, rating: 4.5, numberOfReviews: 456, isActive: true },
      { name: 'Sunflower Oil (1L)', description: 'Pure refined sunflower cooking oil', price: 189, category: 'Groceries', seller: sellerId, images: ['https://images.unsplash.com/photo-1586985289688-cacbb5b13e6c?w=500&h=500&fit=crop'], stock: 200, rating: 4.4, numberOfReviews: 278, isActive: true },
      { name: 'Green Tea (25 bags)', description: 'Fresh and healthy green tea bags', price: 299, category: 'Groceries', seller: sellerId, images: ['https://images.unsplash.com/photo-1597318970387-e0358e2f53cd?w=500&h=500&fit=crop'], stock: 150, rating: 4.6, numberOfReviews: 342, isActive: true },

      // Clothing
      { name: 'Navy Blue Cotton T-Shirt', description: 'Comfortable and durable cotton', price: 399, category: 'Clothing', seller: sellerId, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'], stock: 500, rating: 4.5, numberOfReviews: 678, isActive: true },
      { name: 'Denim Jeans', description: 'Classic blue denim with perfect fit', price: 1299, category: 'Clothing', seller: sellerId, images: ['https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500&h=500&fit=crop'], stock: 200, rating: 4.6, numberOfReviews: 445, isActive: true },
      { name: 'Sports Running Shoes', description: 'Comfortable athletic shoes', price: 2499, category: 'Clothing', seller: sellerId, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'], stock: 150, rating: 4.7, numberOfReviews: 523, isActive: true },

      // Books
      { name: 'The Alchemist by Paulo Coelho', description: 'Inspiring journey of self-discovery', price: 399, category: 'Books', seller: sellerId, images: ['https://images.unsplash.com/photo-1561118215-748e6b0018e2?w=500&h=500&fit=crop'], stock: 100, rating: 4.8, numberOfReviews: 234, isActive: true },
      { name: 'Atomic Habits', description: 'Building good habits and breaking bad ones', price: 499, category: 'Books', seller: sellerId, images: ['https://images.unsplash.com/photo-1507842217343-583f7270bfbb?w=500&h=500&fit=crop'], stock: 80, rating: 4.9, numberOfReviews: 567, isActive: true },

      // Home & Kitchen
      { name: 'Stainless Steel Cookware Set', description: '8-piece non-stick cookware set', price: 3499, category: 'Home & Kitchen', seller: sellerId, images: ['https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&h=500&fit=crop'], stock: 50, rating: 4.6, numberOfReviews: 289, isActive: true },
      { name: 'Coffee Maker', description: '12-cup automatic drip coffee maker', price: 1999, category: 'Home & Kitchen', seller: sellerId, images: ['https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=500&h=500&fit=crop'], stock: 70, rating: 4.5, numberOfReviews: 178, isActive: true },

      // Sports
      { name: 'Yoga Mat (6mm)', description: 'Non-slip yoga mat for exercise', price: 799, category: 'Sports', seller: sellerId, images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop'], stock: 200, rating: 4.6, numberOfReviews: 312, isActive: true },
      { name: 'Dumbbell Set (20kg)', description: 'Adjustable dumbbell set with stand', price: 2499, category: 'Sports', seller: sellerId, images: ['https://images.unsplash.com/photo-1598289431523-66822d9f4c77?w=500&h=500&fit=crop'], stock: 40, rating: 4.7, numberOfReviews: 156, isActive: true },

      // Beauty
      { name: 'Vitamin C Face Serum', description: 'Brightening vitamin C serum', price: 799, category: 'Beauty', seller: sellerId, images: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=500&fit=crop'], stock: 150, rating: 4.7, numberOfReviews: 234, isActive: true },
      { name: 'Moisturizing Face Cream', description: 'Deep hydrating face cream all skin types', price: 599, category: 'Beauty', seller: sellerId, images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&h=500&fit=crop'], stock: 180, rating: 4.6, numberOfReviews: 189, isActive: true }
    ];

    await Product.insertMany(demoProducts);
    console.log(`✅ Successfully added ${demoProducts.length} demo products!`);
    console.log(`✅ Database seeded completely!`);
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createSellerAndProducts();
