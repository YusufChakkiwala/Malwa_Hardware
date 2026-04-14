const Chat = require('../models/Chat');
const ChatMessage = require('../models/ChatMessage');
const { getNextSequence } = require('../utils/sequence');

async function createChat(req, res, next) {
  try {
    const { customerName, phone, shopName } = req.body;
    const id = await getNextSequence('chat');
    const chat = await Chat.create({
      id,
      customerName,
      phone,
      shopName: shopName || null
    });

    return res.status(201).json(chat);
  } catch (error) {
    return next(error);
  }
}

async function getChatMessages(req, res, next) {
  try {
    const chatId = Number(req.params.chatId);

    const chat = await Chat.findOne({ id: chatId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const messages = await ChatMessage.find({ chatId }).sort({ createdAt: 1 });

    return res.json({ chat, messages });
  } catch (error) {
    return next(error);
  }
}

async function getChats(req, res, next) {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const latestMessage = await ChatMessage.find({ chatId: chat.id }).sort({ createdAt: -1 }).limit(1);
        return {
          ...chat.toJSON(),
          messages: latestMessage
        };
      })
    );

    return res.json(enrichedChats);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createChat,
  getChatMessages,
  getChats
};
