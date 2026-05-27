import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  listPages, getPage, createPage, updatePage, deletePage,
  listArticles, getArticle, getArticleById, createArticle, updateArticle, deleteArticle,
  generateSitemap, getRobotsTxt, updateRobotsTxt,
} from '../controllers/cmsController.js';

const router = Router();

// ─── Public ──────────────────────────────────────────────────────────────────
router.get('/sitemap.xml',        generateSitemap);
router.get('/robots.txt',         getRobotsTxt);
router.get('/pages/:slug',        getPage);
router.get('/articles',           listArticles);
router.get('/articles/:slug',     getArticle);

// ─── Admin ───────────────────────────────────────────────────────────────────
const admin = [authenticate, authorize('admin')];

router.get('/admin/pages',            ...admin, listPages);
router.post('/admin/pages',           ...admin, createPage);
router.put('/admin/pages/:id',        ...admin, updatePage);
router.delete('/admin/pages/:id',     ...admin, deletePage);

router.get('/admin/articles',         ...admin, listArticles);
router.get('/admin/articles/:id',     ...admin, getArticleById);
router.post('/admin/articles',        ...admin, createArticle);
router.put('/admin/articles/:id',     ...admin, updateArticle);
router.delete('/admin/articles/:id',  ...admin, deleteArticle);

router.put('/admin/robots',           ...admin, updateRobotsTxt);

export default router;
