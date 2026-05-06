import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Review from '../models/Review.js';

// ── Admin user ──────────────────────────────────────────────────────
const adminUser = {
  name: 'Zimor Admin',
  email: 'admin@zimorindia.com',
  password: 'Admin@123',
  role: 'admin',
  phone: '9876543210',
};

// ── Sample products (7 bags across all categories) ──────────────────
const products = [
  {
    name: 'Classic Shoulder Bag',
    slug: 'classic-shoulder-bag',
    description: 'A timeless shoulder bag crafted from premium vegan leather, perfect for everyday office use. Features a spacious main compartment and interior zip pocket.',
    shortDescription: 'Premium vegan leather shoulder bag for everyday elegance.',
    price: 1499,
    compareAtPrice: 1999,
    category: 'shoulder-bags',
    tags: ['bestseller', 'office'],
    images: [{ url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80&auto=format&fit=crop', publicId: 'seed/shoulder-bag-1', alt: 'Classic Shoulder Bag' }],
    sizes: ['Medium', 'Large'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Tan', hex: '#D2B48C' }],
    stock: 25,
    isFeatured: true,
    material: 'Vegan Leather',
    dimensions: '30 × 25 × 12 cm',
    weight: '650g',
    careInstructions: 'Wipe with a damp cloth. Avoid direct sunlight.',
  },
  {
    name: 'Executive Tote Bag',
    slug: 'executive-tote-bag',
    description: 'Spacious tote bag designed for the modern professional. Fits a 14-inch laptop with room to spare for documents and daily essentials.',
    shortDescription: 'Spacious professional tote with laptop compartment.',
    price: 1799,
    compareAtPrice: 2499,
    category: 'tote-bags',
    tags: ['new-arrival', 'laptop-friendly'],
    images: [{ url: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&q=80&auto=format&fit=crop', publicId: 'seed/tote-bag-1', alt: 'Executive Tote Bag' }],
    sizes: ['Large'],
    colors: [{ name: 'Navy', hex: '#1B2A4A' }, { name: 'Burgundy', hex: '#800020' }],
    stock: 18,
    isFeatured: true,
    material: 'Full-Grain Leather',
    dimensions: '38 × 30 × 14 cm',
    weight: '850g',
    careInstructions: 'Condition with leather balm every 3 months.',
  },
  {
    name: 'Pro Laptop Sleeve Bag',
    slug: 'pro-laptop-sleeve-bag',
    description: 'Slim, padded laptop bag with a dedicated 15.6-inch compartment, front organiser pocket, and detachable shoulder strap.',
    shortDescription: 'Padded laptop bag with organiser pocket.',
    price: 1299,
    category: 'laptop-bags',
    tags: ['tech', 'office'],
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&auto=format&fit=crop', publicId: 'seed/laptop-bag-1', alt: 'Pro Laptop Sleeve Bag' }],
    sizes: ['Medium', 'Large'],
    colors: [{ name: 'Charcoal', hex: '#36454F' }, { name: 'Olive', hex: '#556B2F' }],
    stock: 30,
    isFeatured: false,
    material: 'Water-Resistant Canvas',
    dimensions: '40 × 28 × 6 cm',
    weight: '500g',
    careInstructions: 'Machine washable on gentle cycle.',
  },
  {
    name: 'Mini Crossbody Sling',
    slug: 'mini-crossbody-sling',
    description: 'Compact crossbody sling for hands-free convenience. Adjustable strap, magnetic closure, and card slots inside.',
    shortDescription: 'Compact sling bag for on-the-go days.',
    price: 899,
    compareAtPrice: 1199,
    category: 'crossbody-bags',
    tags: ['casual', 'travel'],
    images: [{ url: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&q=80&auto=format&fit=crop', publicId: 'seed/crossbody-1', alt: 'Mini Crossbody Sling' }],
    sizes: ['Small'],
    colors: [{ name: 'Blush', hex: '#DE5D83' }, { name: 'White', hex: '#FFFFFF' }],
    stock: 40,
    isFeatured: true,
    material: 'PU Leather',
    dimensions: '20 × 15 × 7 cm',
    weight: '300g',
    careInstructions: 'Wipe clean with a soft cloth.',
  },
  {
    name: 'Structured Handbag',
    slug: 'structured-handbag',
    description: 'Elegant structured handbag with gold-tone hardware, top handle, and optional crossbody strap. Ideal for meetings and formal events.',
    shortDescription: 'Elegant structured handbag with gold hardware.',
    price: 2199,
    compareAtPrice: 2999,
    category: 'handbags',
    tags: ['premium', 'formal'],
    images: [{ url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80&auto=format&fit=crop', publicId: 'seed/handbag-1', alt: 'Structured Handbag' }],
    sizes: ['Medium'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Camel', hex: '#C19A6B' }],
    stock: 12,
    isFeatured: true,
    material: 'Genuine Leather',
    dimensions: '28 × 22 × 13 cm',
    weight: '750g',
    careInstructions: 'Store in dust bag. Condition leather periodically.',
  },
  {
    name: 'Everyday Shoulder Tote',
    slug: 'everyday-shoulder-tote',
    description: 'A relaxed shoulder tote that transitions from work to weekend. Soft unstructured silhouette with interior zip pocket and magnetic snap closure.',
    shortDescription: 'Relaxed shoulder tote for work and weekends.',
    price: 1099,
    category: 'shoulder-bags',
    tags: ['casual', 'versatile'],
    images: [{ url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80&auto=format&fit=crop', publicId: 'seed/shoulder-tote-1', alt: 'Everyday Shoulder Tote' }],
    sizes: ['Medium', 'Large'],
    colors: [{ name: 'Grey', hex: '#808080' }, { name: 'Mustard', hex: '#FFDB58' }],
    stock: 22,
    isFeatured: false,
    material: 'Cotton Canvas with Leather Trim',
    dimensions: '35 × 30 × 10 cm',
    weight: '450g',
    careInstructions: 'Spot clean only.',
  },
  {
    name: 'Convertible Laptop Backpack',
    slug: 'convertible-laptop-backpack',
    description: 'Versatile bag that converts from backpack to tote. Padded 14-inch laptop sleeve, anti-theft back pocket, and water-bottle holder.',
    shortDescription: 'Backpack-to-tote convertible with laptop sleeve.',
    price: 1699,
    compareAtPrice: 2199,
    category: 'laptop-bags',
    tags: ['travel', 'convertible'],
    images: [{ url: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&q=80&auto=format&fit=crop', publicId: 'seed/laptop-backpack-1', alt: 'Convertible Laptop Backpack' }],
    sizes: ['Large'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Forest Green', hex: '#228B22' }],
    stock: 15,
    isFeatured: false,
    material: 'Recycled Nylon',
    dimensions: '42 × 30 × 15 cm',
    weight: '700g',
    careInstructions: 'Wipe with damp cloth. Air dry.',
  },
];

// ── Sample coupons ──────────────────────────────────────────────────
const coupons = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 500,
    maxDiscount: 200,
    usageLimit: 100,
    usedCount: 0,
    expiresAt: new Date('2027-12-31'),
    isActive: true,
  },
  {
    code: 'FLAT200',
    discountType: 'fixed',
    discountValue: 200,
    minOrderAmount: 999,
    usageLimit: 50,
    usedCount: 0,
    expiresAt: new Date('2027-06-30'),
    isActive: true,
  },
  {
    code: 'SUMMER15',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1000,
    maxDiscount: 500,
    usageLimit: 200,
    usedCount: 0,
    expiresAt: new Date('2026-09-30'),
    isActive: true,
  },
];

// ── Sample reviews (will be linked to created user & products) ──────
const reviewTemplates = [
  { rating: 5, title: 'Absolutely love it!', comment: 'The quality is outstanding and it fits everything I need for work. Highly recommend.' },
  { rating: 4, title: 'Great bag, minor issue', comment: 'Beautiful design and sturdy build. The zipper is a bit stiff but overall very happy.' },
  { rating: 5, title: 'Perfect work companion', comment: 'I get compliments every day at the office. The leather smell is divine.' },
  { rating: 3, title: 'Good but expected more', comment: 'Decent quality for the price. The colour was slightly different from the photos.' },
  { rating: 4, title: 'Solid purchase', comment: 'Well-made bag with plenty of space. Shipping was fast too.' },
];

// ── Seed runner ─────────────────────────────────────────────────────
async function seed() {
  try {
    await connectDB();
    console.log('Clearing existing data…');

    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
    ]);

    // Create admin user (password is hashed by pre-save hook)
    console.log('Creating admin user…');
    const admin = await User.create(adminUser);

    // Create products
    console.log('Creating products…');
    const createdProducts = await Product.insertMany(products);

    // Create coupons
    console.log('Creating coupons…');
    await Coupon.insertMany(coupons);

    // Create reviews (spread across first 5 products)
    console.log('Creating reviews…');
    const reviews = reviewTemplates.map((tpl, i) => ({
      ...tpl,
      user: admin._id,
      product: createdProducts[i % createdProducts.length]._id,
    }));
    const createdReviews = await Review.insertMany(reviews);

    // Update product averageRating and numReviews
    const reviewsByProduct = {};
    for (const review of createdReviews) {
      const pid = review.product.toString();
      if (!reviewsByProduct[pid]) reviewsByProduct[pid] = [];
      reviewsByProduct[pid].push(review.rating);
    }

    for (const [productId, ratings] of Object.entries(reviewsByProduct)) {
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(avg * 10) / 10,
        numReviews: ratings.length,
      });
    }

    console.log('Seed complete ✓');
    console.log(`  Admin: ${admin.email} / Admin@123`);
    console.log(`  Products: ${createdProducts.length}`);
    console.log(`  Coupons: ${coupons.length}`);
    console.log(`  Reviews: ${createdReviews.length}`);

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
