import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  size:     { type: String },
  color:    { type: String },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderNumber: { type: String, required: true, unique: true },
  items:       [orderItemSchema],
  shippingAddress: {
    fullName:     { type: String, required: true },
    phone:        { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city:         { type: String, required: true },
    state:        { type: String, required: true },
    pincode:      { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
  paymentResult: {
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  subtotal:     { type: Number, required: true },
  discount:     { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  total:        { type: Number, required: true },
  couponCode:   { type: String },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status:    { type: String },
    timestamp: { type: Date, default: Date.now },
    note:      { type: String },
  }],
  isPaid:      { type: Boolean, default: false },
  paidAt:      { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  notes:       { type: String },
}, { timestamps: true });

// Indexes (orderNumber index is created automatically by unique: true)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
