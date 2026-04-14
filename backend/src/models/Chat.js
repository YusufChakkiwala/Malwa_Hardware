const mongoose = require('mongoose');
const cleanJson = require('./plugins/cleanJson');

const chatSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    shopName: { type: String, default: null, trim: true }
  },
  {
    collection: 'chats',
    timestamps: { createdAt: true, updatedAt: false }
  }
);

chatSchema.virtual('messages', {
  ref: 'ChatMessage',
  localField: 'id',
  foreignField: 'chatId'
});

chatSchema.plugin(cleanJson);

module.exports = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
