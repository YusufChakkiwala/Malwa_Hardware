const mongoose = require('mongoose');
const cleanJson = require('./plugins/cleanJson');

const productSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    categoryId: { type: Number, required: true, index: true },
    imageUrl: { type: String, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 }
  },
  {
    collection: 'products',
    timestamps: true
  }
);

productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: 'id',
  justOne: true
});

productSchema.plugin(cleanJson);

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
