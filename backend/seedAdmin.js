import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('admin@123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@healthcare.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      isFirstLogin: false
    });

    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@healthcare.com');
    console.log('🔑 Password: admin@123');
    process.exit();

  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();