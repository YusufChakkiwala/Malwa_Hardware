const mongoose = require('mongoose');
const cleanJson = require('./plugins/cleanJson');

const categorySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }
  },
  {
    collection: 'categories',
    timestamps: true
  }
);

categorySchema.plugin(cleanJson);

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);
