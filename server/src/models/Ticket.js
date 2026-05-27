import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole:{ type: String, enum: ['customer', 'admin'], required: true },
  body:      { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:      { type: String, required: true, trim: true },
  status:       { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority:     { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  category:     { type: String, enum: ['order', 'payment', 'product', 'account', 'other'], default: 'other' },
  messages:     [messageSchema],
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt:   { type: Date },
}, { timestamps: true });

ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ user: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
