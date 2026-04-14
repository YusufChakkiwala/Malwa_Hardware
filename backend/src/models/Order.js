const mongoose = require('mongoose');
const cleanJson = require('./plugins/cleanJson');

const orderSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    customerUid: { type: String, trim: true, index: true, default: '' },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending'
    }
  },
  {
    collection: 'orders',
    timestamps: { createdAt: true, updatedAt: false }
  }
);

orderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: 'id',
  foreignField: 'orderId'
});

orderSchema.plugin(cleanJson);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
