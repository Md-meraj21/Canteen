// backend/scripts/seedMilitaryUser.js
// This script adds a test military user to the database for admin verification testing

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

async function seedMilitaryUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop-karo');
    
    const testMilitaryUser = {
      name: 'Capt. Rajesh Kumar',
      email: 'captain.rajesh@military.com',
      phone: '9876543210',
      password: 'test123456',
      militaryId: 'IND-MA-45-2024',
      rank: 'Captain',
      idCardImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABQAFADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWm5ybnJ2eoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba2uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9k=',
      verificationStatus: 'pending',
      createdAt: new Date()
    };

    // Check if user already exists
    const existingUser = await User.findOne({ email: testMilitaryUser.email });
    
    if (existingUser) {
      console.log('✅ Test military user already exists');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Status: ${existingUser.verificationStatus}`);
      console.log(`   Rank: ${existingUser.rank}`);
      process.exit(0);
    }

    // Create new user (password will be hashed by User.pre('save'))
    const newUser = new User(testMilitaryUser);
    await newUser.save();

    console.log('✅ Test military user created successfully!');
    console.log('');
    console.log('User Details:');
    console.log(`  Email: ${newUser.email}`);
    console.log(`  Password: test123456`);
    console.log(`  Name: ${newUser.name}`);
    console.log(`  Rank: ${newUser.rank}`);
    console.log(`  Military ID: ${newUser.militaryId}`);
    console.log(`  Verification Status: ${newUser.verificationStatus}`);
    console.log('');
    console.log('Next Steps:');
    console.log('  1. Login as admin: seller@shopkaro.com / seller123');
    console.log('  2. Click "🎖️ Verify" button');
    console.log('  3. Find "Capt. Rajesh Kumar" in pending list');
    console.log('  4. Click "✅ Approve & Verify"');
    console.log('  5. Test login with above credentials');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding user:', error.message);
    process.exit(1);
  }
}

seedMilitaryUser();
