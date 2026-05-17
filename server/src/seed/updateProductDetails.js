import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';

const shoulderBagUpdate = {
  features: [
    'Timeless Curved Silhouette – A sleek, structured shape that complements both formal and casual looks.',
    'Compact Yet Spacious – Smart interior design to fit your daily essentials like phone, wallet, keys, and makeup.',
    'Secure Flap Closure – Elegant front strap with a sturdy buckle detail for added safety and style.',
    'Lightweight Comfort – Easy to carry all day without strain on your shoulder.',
    'Adjustable Shoulder Strap – Designed for a comfortable fit and versatile styling.',
    'Minimalist Aesthetic – Neutral tones with contrast detailing for a refined, modern look.',
  ],
  material: ['Premium canvas body with high-quality vegan leather trims'],
  innerLining: ['Soft, durable fabric lining for added protection'],
  hardware: ['Rust-resistant metal fittings'],
  careInstructions: [
    'Wipe gently with a soft, damp cloth to clean',
    'Avoid prolonged exposure to direct sunlight to maintain color',
    'Do not wash or tumble dry',
    'Store in a dust bag when not in use',
    'Keep away from sharp objects to prevent scratches',
  ],
  stylingGuide: [
    'Work Ready: Pair with a structured blazer, trousers, and loafers for a polished office look',
    'Casual Chic: Style with denim, a basic tee, and sneakers for effortless everyday wear',
    'Brunch Vibes: Match with flowy dresses or co-ord sets for a soft, feminine aesthetic',
    'Evening Minimal: Carry it with monochrome outfits and gold accessories for an elegant finish',
  ],
};

const laptopBagUpdate = {
  features: [
    'Spacious & Structured Design – Fits up to a 14-inch laptop with ease, along with daily essentials.',
    'Smart Organization – 1 Dedicated Laptop Compartment, 4 Slip Pockets for documents & accessories, 1 Zipper Pocket for valuables, 3 Card Slots for quick access, 2 Pen Slots, 1 Key Holder',
    'Secure Zipper Closure – Ensures your belongings stay safe throughout the day.',
    'Convertible Carry – Comes with an adjustable & detachable sling strap for versatile use.',
    'Comfortable Carry – Sturdy handles with a 14 cm drop for easy shoulder carry.',
  ],
  material: ['Premium vegan PU leather (cruelty-free and durable)'],
  innerLining: ['High-quality inner lining for added protection and longevity'],
  hardware: [],
  careInstructions: [
    'Wipe with a soft, damp cloth to clean',
    'Avoid prolonged exposure to direct sunlight',
    'Store in a dust bag when not in use',
    'Keep away from sharp objects to prevent scratches',
  ],
  stylingGuide: [
    'Work Ready – Pair with formal office wear like blazers, trousers, and structured dresses for a polished look.',
    'Business Travel – Carry with co-ord sets or smart casual outfits for a refined travel style.',
    'Day-to-Day Professional – Style with kurtas, shirts, or minimal outfits for a clean, confident vibe.',
    'Versatile Carry – Use top handles for a classic office look or sling it crossbody for hands-free convenience.',
  ],
};

async function run() {
  await connectDB();

  // Update Zimor Classic Shoulder Bag
  const shoulder = await Product.findOneAndUpdate(
    { slug: 'zimor-classic-shoulder-bag' },
    { $set: shoulderBagUpdate },
    { new: true }
  );
  if (shoulder) {
    console.log(`Updated shoulder bag: "${shoulder.name}"`);
  } else {
    console.warn('Shoulder bag not found (slug: zimor-classic-shoulder-bag)');
  }

  // Update both laptop bags
  const laptopSlugs = ['zimor-caramel-work-tote', 'zimor-sobol-laptop-bag'];
  for (const slug of laptopSlugs) {
    const bag = await Product.findOneAndUpdate(
      { slug },
      { $set: laptopBagUpdate },
      { new: true }
    );
    if (bag) {
      console.log(`Updated laptop bag: "${bag.name}"`);
    } else {
      console.warn(`Laptop bag not found (slug: ${slug})`);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
