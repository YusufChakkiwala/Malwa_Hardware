const mongoose = require('mongoose');
const cleanJson = require('./plugins/cleanJson');

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    orderId: { type: Number, required: true, index: true },
    productId: { type: Number, required: true, index: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true, min: 0 }
  },
  {
    collection: 'order_items',
    timestamps: false
  }
);

orderItemSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: 'id',
  justOne: true
});

orderItemSchema.plugin(cleanJson);

module.exports = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);
