const mongoose = require('mongoose');
const cleanJson = require('./plugins/cleanJson');

const querySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    shopName: { type: String, default: null, trim: true },
    message: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ['new', 'open', 'closed'],
      default: 'new'
    }
  },
  {
    collection: 'queries',
    timestamps: { createdAt: true, updatedAt: false }
  }
);

querySchema.plugin(cleanJson);

module.exports = mongoose.models.Query || mongoose.model('Query', querySchema);
