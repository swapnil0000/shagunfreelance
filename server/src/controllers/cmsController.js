import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import Page from '../models/Page.js';
import Article from '../models/Article.js';
import Product from '../models/Product.js';
import Settings from '../models/Settings.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

// ─── Pages ───────────────────────────────────────────────────────────────────

export const listPages = async (req, res, next) => {
  try {
    const pages = await Page.find().sort({ updatedAt: -1 }).select('-content');
    res.json({ status: 'success', data: { pages } });
  } catch (e) { next(e); }
};

export const getPage = async (req, res, next) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ status: 'error', message: 'Page not found' });
    res.json({ status: 'success', data: { page } });
  } catch (e) { next(e); }
};

export const createPage = async (req, res, next) => {
  try {
    const { title, content, metaTitle, metaDescription, ogImage, status, publishedAt } = req.body;
    const slug = req.body.slug || slugify(title);
    const page = await Page.create({ slug, title, content, metaTitle, metaDescription, ogImage, status, publishedAt });
    res.status(201).json({ status: 'success', data: { page } });
  } catch (e) { next(e); }
};

export const updatePage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ status: 'error', message: 'Page not found' });

    const { title, content, metaTitle, metaDescription, ogImage, status, publishedAt, slug } = req.body;
    if (slug && slug !== page.slug && !page.isSystem) page.slug = slug;
    if (title           !== undefined) page.title           = title;
    if (content         !== undefined) page.content         = content;
    if (metaTitle       !== undefined) page.metaTitle       = metaTitle;
    if (metaDescription !== undefined) page.metaDescription = metaDescription;
    if (ogImage         !== undefined) page.ogImage         = ogImage;
    if (status          !== undefined) page.status          = status;
    if (publishedAt     !== undefined) page.publishedAt     = publishedAt;

    if (status === 'published' && !page.publishedAt) page.publishedAt = new Date();

    await page.save();
    res.json({ status: 'success', data: { page } });
  } catch (e) { next(e); }
};

export const deletePage = async (req, res, next) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ status: 'error', message: 'Page not found' });
    if (page.isSystem)  return res.status(400).json({ status: 'error', message: 'Cannot delete a system page' });
    await page.deleteOne();
    res.json({ status: 'success', message: 'Page deleted' });
  } catch (e) { next(e); }
};

// ─── Articles ─────────────────────────────────────────────────────────────────

export const listArticles = async (req, res, next) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status)   query.status   = status;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [articles, total] = await Promise.all([
      Article.find(query)
        .populate('author', 'name')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip).limit(Number(limit))
        .select('-content'),
      Article.countDocuments(query),
    ]);

    res.json({
      status: 'success',
      data: { articles, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } },
    });
  } catch (e) { next(e); }
};

export const getArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug }).populate('author', 'name avatar');
    if (!article) return res.status(404).json({ status: 'error', message: 'Article not found' });
    res.json({ status: 'success', data: { article } });
  } catch (e) { next(e); }
};

export const getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'name');
    if (!article) return res.status(404).json({ status: 'error', message: 'Article not found' });
    res.json({ status: 'success', data: { article } });
  } catch (e) { next(e); }
};

export const createArticle = async (req, res, next) => {
  try {
    const { title, excerpt, content, coverImage, category, tags, status, publishedAt, metaTitle, metaDescription, ogImage } = req.body;
    const slug = req.body.slug || slugify(title);
    const article = await Article.create({
      title, slug, excerpt, content, coverImage, category, tags,
      status, publishedAt, metaTitle, metaDescription, ogImage,
      author: req.user._id,
    });
    res.status(201).json({ status: 'success', data: { article } });
  } catch (e) { next(e); }
};

export const updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ status: 'error', message: 'Article not found' });

    const fields = ['title', 'slug', 'excerpt', 'content', 'coverImage', 'category', 'tags', 'status', 'publishedAt', 'metaTitle', 'metaDescription', 'ogImage'];
    fields.forEach((f) => { if (req.body[f] !== undefined) article[f] = req.body[f]; });
    if (req.body.status === 'published' && !article.publishedAt) article.publishedAt = new Date();

    await article.save();
    res.json({ status: 'success', data: { article } });
  } catch (e) { next(e); }
};

export const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ status: 'error', message: 'Article not found' });
    res.json({ status: 'success', message: 'Article deleted' });
  } catch (e) { next(e); }
};

// ─── Sitemap ─────────────────────────────────────────────────────────────────

export const generateSitemap = async (req, res, next) => {
  try {
    const baseUrl = process.env.CLIENT_URL?.split(',')[0]?.trim() || 'http://localhost:5173';

    const [products, articles, pages] = await Promise.all([
      Product.find({ isActive: true }).select('slug updatedAt').lean(),
      Article.find({ status: 'published' }).select('slug updatedAt').lean(),
      Page.find({ status: 'published' }).select('slug updatedAt').lean(),
    ]);

    const links = [
      { url: '/',        changefreq: 'weekly',  priority: 1.0 },
      { url: '/shop',    changefreq: 'daily',   priority: 0.9 },
      { url: '/about',   changefreq: 'monthly', priority: 0.6 },
      { url: '/contact', changefreq: 'monthly', priority: 0.5 },
      ...products.map((p)  => ({ url: `/product/${p.slug}`, changefreq: 'weekly', priority: 0.8, lastmod: p.updatedAt })),
      ...articles.map((a)  => ({ url: `/blog/${a.slug}`,    changefreq: 'monthly', priority: 0.7, lastmod: a.updatedAt })),
      ...pages.map((pg)    => ({ url: `/pages/${pg.slug}`,  changefreq: 'monthly', priority: 0.6, lastmod: pg.updatedAt })),
    ];

    const stream = new SitemapStream({ hostname: baseUrl });
    const xml    = await streamToPromise(Readable.from(links).pipe(stream)).then((d) => d.toString());

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (e) { next(e); }
};

// ─── Robots.txt ───────────────────────────────────────────────────────────────

export const getRobotsTxt = async (req, res, next) => {
  try {
    const setting = await Settings.findOne({ key: 'robotsTxt' });
    const content = setting?.value || `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${process.env.CLIENT_URL?.split(',')[0]?.trim() || ''}/sitemap.xml`;
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (e) { next(e); }
};

export const updateRobotsTxt = async (req, res, next) => {
  try {
    const { content } = req.body;
    await Settings.findOneAndUpdate({ key: 'robotsTxt' }, { value: content }, { upsert: true, new: true });
    res.json({ status: 'success', message: 'robots.txt updated' });
  } catch (e) { next(e); }
};
