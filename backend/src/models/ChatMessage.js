const mongoose = require('mongoose');
const cleanJson = require('./plugins/cleanJson');

const chatMessageSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    chatId: { type: Number, required: true, index: true },
    sender: { type: String, enum: ['customer', 'admin'], required: true },
    messageText: { type: String, default: null, trim: true },
    imageUrl: { type: String, default: null }
  },
  {
    collection: 'chat_messages',
    timestamps: { createdAt: true, updatedAt: false }
  }
);

chatMessageSchema.plugin(cleanJson);

module.exports = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
