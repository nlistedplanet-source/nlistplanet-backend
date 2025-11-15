const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const resetDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all existing users
    const deleteResult = await User.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} users`);

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('Div@10390Beena', 10);

    // Generate funny username
    const prefixes = [
      'ironman', 'batman', 'superman', 'thor', 'hulk', 'rajnikant', 'salmankhan',
      'shahrukhkhan', 'amitabhbachchan', 'sherlock', 'delhi', 'mumbai', 'wolf',
      'tiger', 'lion', 'eagle', 'ninja', 'samurai', 'einstein', 'crypto', 'stock'
    ];
    const suffixes = [
      'trader', 'investor', 'pro', 'master', 'king', 'boss', 'legend', 'warrior',
      'genius', 'alpha', 'sigma', 'elite', '_007', '_420', '_999'
    ];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const generatedUsername = `@${randomPrefix}_${randomSuffix}`;

    // Create admin user
    const adminUser = new User({
      userId: 'ADMIN001',
      username: generatedUsername,
      name: 'NList Planet Admin',
      email: 'nlistedplanet@gmail.com',
      password: hashedPassword,
      mobile: '9999999999',
      userType: 'admin',
      roles: ['buyer', 'seller', 'admin'],
      rating: 5,
      emailVerified: true,
      mobileVerified: true,
      joinedDate: new Date()
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: nlistedplanet@gmail.com');
    console.log('🔑 Password: Div@10390Beena');
    console.log('👤 User ID: ADMIN001');
    console.log('📛 Username:', generatedUsername);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetDatabase();
