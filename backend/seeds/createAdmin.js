const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Delete existing admin if any
    await User.deleteOne({ email: 'seller@shopkaro.com' });
    console.log('✅ Cleared old admin user');

    // Create admin user
    const adminUser = new User({
      name: 'Shop Karo Store',
      email: 'seller@shopkaro.com',
      username: 'admin',
      phone: '+91-1234567890',
      password: 'seller123', // This will be hashed by the pre-save hook
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: seller@shopkaro.com');
    console.log('Password: seller123');
    console.log('Role: admin');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();
