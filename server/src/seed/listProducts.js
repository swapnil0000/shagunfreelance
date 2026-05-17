import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';

async function run() {
  await connectDB();
  const products = await Product.find({}, 'name slug category features material careInstructions stylingGuide').lean();
  products.forEach(p => {
    console.log(`\n--- ${p.name} (${p.slug}) ---`);
    console.log('features:', JSON.stringify(p.features));
    console.log('material:', JSON.stringify(p.material));
    console.log('careInstructions:', JSON.stringify(p.careInstructions));
    console.log('stylingGuide:', JSON.stringify(p.stylingGuide));
  });
  await mongoose.disconnect();
}

run().catch(err => { console.error(err.message); process.exit(1); });
