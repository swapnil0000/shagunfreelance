import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  slug:             { type: String, required: true, unique: true },
  description:      { type: String, required: true },
  shortDescription: { type: String },
  price:            { type: Number, required: true, min: 0 },
  compareAtPrice:   { type: Number, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['shoulder-bags', 'tote-bags', 'laptop-bags', 'crossbody-bags', 'handbags'],
  },
  tags:   [{ type: String }],
  images: [{
    url:      { type: String, required: true },
    publicId: { type: String, required: true },
    alt:      { type: String },
  }],
  sizes:  [{ type: String }],
  colors: [{
    name: { type: String },
    hex:  { type: String },
  }],
  stock:            { type: Number, required: true, default: 0, min: 0 },
  isFeatured:       { type: Boolean, default: false },
  isActive:         { type: Boolean, default: true },
  averageRating:    { type: Number, default: 0, min: 0, max: 5 },
  numReviews:       { type: Number, default: 0 },
  material:         { type: String },
  dimensions:       { type: String },
  weight:           { type: String },
  careInstructions: { type: String },
}, { timestamps: true });

// Indexes (slug index is created automatically by unique: true)
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
