import Product from '../models/Product.js';
import AppError from '../utils/AppError.js';

// Fields needed to render a product card / cart line. Excludes the heavy text
// arrays (description, features, careInstructions, stylingGuide, dimensions...)
// which are only needed on the product detail page.
const CARD_FIELDS =
  'name slug price compareAtPrice images averageRating numReviews stock sizes colors category isFeatured featuredOrder';

/**
 * Get products with filtering, sorting, and pagination.
 */
export const getProducts = async ({ category, minPrice, maxPrice, search, sort, page = 1, limit = 12 }) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(50, Math.max(1, Number(limit) || 12));

  const query = { isActive: true };

  if (category) query.category = category;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (search) query.$text = { $search: search };

  const sortOptions = {
    'price-asc':  { price: 1 },
    'price-desc': { price: -1 },
    'newest':     { createdAt: -1 },
    'rating':     { averageRating: -1 },
    'popular':    { numReviews: -1 },
  };
  // Default = admin-set featuredOrder first (lowest wins), then newest.
  // This keeps the Shop default order in sync with the homepage Featured
  // Collection. Explicit sorts (price, newest, rating, popular) override.
  const sortBy = sortOptions[sort] || { featuredOrder: 1, createdAt: -1 };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query).select(CARD_FIELDS).sort(sortBy).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 0,
    },
  };
};

/**
 * Get featured products (active and featured).
 */
export const getFeaturedProducts = async () => {
  // featuredOrder defaults to 9999 in the schema, so unset products sort
  // naturally after admin-ordered ones — no in-memory sort needed.
  return Product.find({ isActive: true, isFeatured: true })
    .select(CARD_FIELDS)
    .sort({ featuredOrder: 1, createdAt: -1 })
    .lean();
};

/**
 * Get a single product by slug.
 */
export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, isActive: true }).lean();
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  return product;
};

/**
 * Generate a URL-safe slug from a product name.
 * Appends a short suffix if the slug already exists.
 */
const generateSlug = async (name, excludeId = null) => {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const query = { slug };
  if (excludeId) query._id = { $ne: excludeId };

  const existing = await Product.findOne(query);
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return slug;
};

/**
 * Create a new product (admin).
 */
export const createProduct = async (data) => {
  const slug = await generateSlug(data.name);
  const product = await Product.create({ ...data, slug });
  return product;
};

/**
 * Update an existing product (admin).
 * Regenerates slug if name changed.
 */
export const updateProduct = async (id, data) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (data.name && data.name !== product.name) {
    data.slug = await generateSlug(data.name, id);
  }

  Object.assign(product, data);
  await product.save();

  return product;
};

/**
 * Bulk-update featured order: assigns featuredOrder = 1..N based on array position.
 * Used by the admin drag-and-drop reorder UI.
 */
export const reorderFeaturedProducts = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError('ids must be a non-empty array', 400);
  }
  const ops = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { featuredOrder: index + 1 } },
    },
  }));
  await Product.bulkWrite(ops);
};

/**
 * Get a single product by ID for admin editing (no isActive filter).
 */
export const getProductByIdAdmin = async (id) => {
  const product = await Product.findById(id).lean();
  if (!product) throw new AppError('Product not found', 404);
  return product;
};

/**
 * Soft-delete a product by setting isActive to false (admin).
 */
export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.isActive = false;
  await product.save();

  return product;
};
