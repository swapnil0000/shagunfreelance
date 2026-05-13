import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

const ADMIN = {
  name: 'Zimor Admin',
  email: 'admin@zimorindia.com',
  password: 'Admin@123',
  role: 'admin',
  phone: '9876543210',
};

async function createAdmin() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN.email });

  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Updated existing user "${ADMIN.email}" to admin role.`);
    } else {
      console.log(`Admin already exists: ${ADMIN.email}`);
    }
  } else {
    await User.create(ADMIN);
    console.log('Admin user created successfully!');
    console.log(`  Email   : ${ADMIN.email}`);
    console.log(`  Password: ${ADMIN.password}`);
  }

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
