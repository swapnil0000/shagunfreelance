import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  slug:             { type: String, required: true, unique: true },
  description:      { type: String, default: '' },
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
  features:         [{ type: String }],
  material:         [{ type: String }],
  hardware:         [{ type: String }],
  innerLining:      [{ type: String }],
  careInstructions: [{ type: String }],
  dimensionLength:  { type: String },
  dimensionHeight:  { type: String },
  dimensionWidth:   { type: String },
  strapDrop:        { type: String },
  weight:           { type: String },
  keyHighlights:    [{ type: String }],
  stylingGuide:     [{ type: String }],
}, { timestamps: true });

// Every listing query filters on isActive; compound indexes cover the common
// filter + sort combinations so Mongo can serve them without a collection scan.
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, category: 1 });
productSchema.index({ isActive: 1, price: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
