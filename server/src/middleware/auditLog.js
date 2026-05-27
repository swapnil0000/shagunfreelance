import AuditLog from '../models/AuditLog.js';

/**
 * Middleware factory that logs admin mutations to the AuditLog collection.
 * Usage: router.post('/products', authenticate, authorize('admin'), auditLog('CREATE', 'product'), handler)
 */
export const auditLog = (action, resource) => async (req, res, next) => {
  // Capture original json() to intercept the response
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    if (res.statusCode < 400 && req.user) {
      const resourceId =
        req.params.id ||
        body?.data?._id ||
        body?.data?.product?._id ||
        body?.data?.order?._id ||
        undefined;

      AuditLog.create({
        adminId:    req.user._id,
        adminEmail: req.user.email,
        action,
        resource,
        resourceId:  resourceId?.toString(),
        details:     req.method !== 'GET' ? req.body : undefined,
        ip:          req.ip,
      }).catch(() => {}); // fire-and-forget, never block the response
    }
    return originalJson(body);
  };

  next();
};
