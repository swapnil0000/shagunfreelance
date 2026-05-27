import * as productService from '../services/productService.js';

/**
 * GET /api/products
 */
export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/featured
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts();
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    res.status(200).json({ status: 'success', data: { products } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/products/:slug
 */
export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/products (admin)
 */
export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ status: 'success', data: { product } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/products/:id (admin)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: { product } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/products/:id (admin — soft delete)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ status: 'success', message: 'Product deactivated' });
  } catch (error) {
    next(error);
  }
};
