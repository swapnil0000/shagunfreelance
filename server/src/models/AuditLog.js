import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminEmail: { type: String, required: true },
  action:     { type: String, required: true },   // e.g. CREATE_PRODUCT, UPDATE_ORDER
  resource:   { type: String, required: true },   // e.g. product, order, coupon
  resourceId: { type: String },
  details:    { type: mongoose.Schema.Types.Mixed },
  ip:         { type: String },
}, { timestamps: true });

auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
