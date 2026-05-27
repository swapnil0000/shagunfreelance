import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  slug:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  title:           { type: String, required: true, trim: true },
  content:         { type: String, default: '' },        // HTML from TipTap
  metaTitle:       { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  ogImage:         { type: String, default: '' },
  status:          { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
  publishedAt:     { type: Date },
  isSystem:        { type: Boolean, default: false },    // system pages cannot be deleted
}, { timestamps: true });

pageSchema.index({ status: 1 });

const Page = mongoose.model('Page', pageSchema);
export default Page;
