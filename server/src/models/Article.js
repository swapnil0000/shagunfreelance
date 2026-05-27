import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title:           { type: String, required: true, trim: true },
  slug:            { type: String, required: true, unique: true, lowercase: true, trim: true },
  excerpt:         { type: String, default: '' },
  content:         { type: String, default: '' },        // HTML from TipTap
  coverImage:      { type: String, default: '' },
  author:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category:        { type: String, default: 'General', trim: true },
  tags:            [{ type: String, trim: true }],
  status:          { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
  publishedAt:     { type: Date },
  metaTitle:       { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  ogImage:         { type: String, default: '' },
}, { timestamps: true });

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });

const Article = mongoose.model('Article', articleSchema);
export default Article;
