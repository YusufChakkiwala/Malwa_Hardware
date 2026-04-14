const mongoose = require('mongoose');
const cleanJson = require('./plugins/cleanJson');

const adminSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'manager'],
      default: 'owner'
    }
  },
  {
    collection: 'admins',
    timestamps: { createdAt: true, updatedAt: false }
  }
);

adminSchema.plugin(cleanJson);

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
