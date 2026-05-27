import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getCustomers,
  toggleSuspendUser,
  getTransactions,
  getAuditLogs,
  getReports,
} from '../controllers/adminController.js';
import {
  listEmailTemplates,
  getEmailTemplate,
  updateEmailTemplate,
  resetEmailTemplate,
  sendTestEmail,
  listNotifications,
  markNotificationsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/stats',                    getDashboardStats);
router.get('/customers',                getCustomers);
router.patch('/customers/:id/suspend',  toggleSuspendUser);
router.get('/transactions',             getTransactions);
router.get('/audit-logs',               getAuditLogs);
router.get('/reports',                  getReports);

// Email templates
router.get('/email-templates',              listEmailTemplates);
router.get('/email-templates/:id',          getEmailTemplate);
router.put('/email-templates/:id',          updateEmailTemplate);
router.post('/email-templates/:id/reset',   resetEmailTemplate);
router.post('/email-templates/:id/test',    sendTestEmail);

// In-app notifications
router.get('/notifications',                listNotifications);
router.patch('/notifications/read',         markNotificationsRead);
router.delete('/notifications/:id',         deleteNotification);

export default router;
