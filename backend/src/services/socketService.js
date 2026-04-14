const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const { getNextSequence } = require('../utils/sequence');

const messageBuckets = new Map();

function canSendMessage(socket) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxMessages = 10;
  const key = socket.handshake.address || socket.id;
  const current = messageBuckets.get(key) || [];
  const fresh = current.filter((timestamp) => now - timestamp < windowMs);

  if (fresh.length >= maxMessages) {
    messageBuckets.set(key, fresh);
    return false;
  }

  fresh.push(now);
  messageBuckets.set(key, fresh);
  return true;
}

function initSocketService(io) {
  io.on('connection', (socket) => {
    socket.on('chat:connect', async (payload, callback) => {
      try {
        const { chatId, customerName, phone, shopName } = payload || {};
        let chat;

        if (chatId) {
          chat = await Chat.findOne({ id: Number(chatId) });
        }

        if (!chat) {
          if (!customerName || !phone) {
            throw new Error('customerName and phone are required to start chat');
          }

          const id = await getNextSequence('chat');
          chat = await Chat.create({
            id,
            customerName,
            phone,
            shopName: shopName || null
          });
        }

        socket.join(`chat:${chat.id}`);
        socket.data.chatId = chat.id;

        const history = await ChatMessage.find({ chatId: chat.id }).sort({ createdAt: 1 });

        io.to(`chat:${chat.id}`).emit('chat:history', { chatId: chat.id, history });
        if (callback) callback({ ok: true, chatId: chat.id, history });
      } catch (error) {
        if (callback) callback({ ok: false, message: error.message });
      }
    });

    socket.on('chat:message', async (payload, callback) => {
      try {
        if (!canSendMessage(socket)) {
          throw new Error('Rate limit exceeded for chat messages');
        }

        const { chatId, sender, messageText, imageUrl } = payload || {};
        const parsedChatId = Number(chatId);

        if (!parsedChatId || !sender || (!messageText && !imageUrl)) {
          throw new Error('chatId, sender and message/image are required');
        }

        const chat = await Chat.findOne({ id: parsedChatId });
        if (!chat) {
          throw new Error('Chat not found');
        }

        const id = await getNextSequence('chat_message');
        const message = await ChatMessage.create({
          id,
          chatId: parsedChatId,
          sender,
          messageText: messageText || null,
          imageUrl: imageUrl || null
        });

        io.to(`chat:${parsedChatId}`).emit('chat:message', message);
        if (callback) callback({ ok: true, message });
      } catch (error) {
        if (callback) callback({ ok: false, message: error.message });
      }
    });

    socket.on('chat:typing', (payload) => {
      const { chatId, sender, typing } = payload || {};
      if (!chatId) return;
      socket.to(`chat:${chatId}`).emit('chat:typing', { chatId, sender, typing: Boolean(typing) });
    });

    socket.on('chat:history', async (payload, callback) => {
      try {
        const chatId = Number(payload?.chatId || socket.data.chatId);
        if (!chatId) {
          throw new Error('chatId is required');
        }

        const history = await ChatMessage.find({ chatId }).sort({ createdAt: 1 });

        socket.emit('chat:history', { chatId, history });
        if (callback) callback({ ok: true, history });
      } catch (error) {
        if (callback) callback({ ok: false, message: error.message });
      }
    });
  });
}

module.exports = { initSocketService };
