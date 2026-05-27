import mongoose from 'mongoose';

const emailTemplateSchema = new mongoose.Schema({
  name:      { type: String, required: true, unique: true },   // machine key e.g. 'order-confirmation'
  label:     { type: String, required: true },                  // human label
  subject:   { type: String, required: true },
  body:      { type: String, required: true },                  // HTML with {{variable}} placeholders
  variables: [{ type: String }],                                // list of supported placeholder names
  isSystem:  { type: Boolean, default: true },
}, { timestamps: true });

const EmailTemplate = mongoose.model('EmailTemplate', emailTemplateSchema);
export default EmailTemplate;
