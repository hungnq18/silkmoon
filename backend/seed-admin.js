const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const UserSchema = new mongoose.Schema({
      email: String,
      passwordHash: String,
      fullName: String,
      role: String,
      isActive: Boolean
    }, { collection: 'users', timestamps: true });
    
    // Check if model already exists to prevent OverwriteModelError
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    const email = 'admin@silkmoon.online';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user already exists!');
      console.log(`Email: ${email}`);
      console.log('Password is what you set previously (default was 123456).');
      process.exit(0);
    }
    
    const passwordHash = await bcrypt.hash('123456', 10);
    
    await User.create({
      email,
      passwordHash,
      fullName: 'Silkmoon Admin',
      role: 'admin',
      isActive: true
    });
    
    console.log('✅ Admin seeded successfully!');
    console.log('---------------------------');
    console.log('Email: admin@silkmoon.online');
    console.log('Pass:  123456');
    console.log('---------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seed();
