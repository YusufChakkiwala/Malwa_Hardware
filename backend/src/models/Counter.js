const mongoose = require('mongoose');
const cleanJson = require('./plugins/cleanJson');

const counterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    seq: { type: Number, default: 0 }
  },
  {
    collection: 'counters',
    timestamps: true
  }
);

counterSchema.plugin(cleanJson);

module.exports = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
