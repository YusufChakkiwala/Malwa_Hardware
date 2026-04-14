const express = require('express');
const { z } = require('zod');
const { createChat, getChatMessages, getChats } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { chatLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const createChatSchema = z.object({
  body: z.object({
    customerName: z.string().min(2),
    phone: z.string().min(8),
    shopName: z.string().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

router.post('/chats', chatLimiter, validate(createChatSchema), createChat);
router.get('/chats', authMiddleware, getChats);
router.get('/chats/:chatId/messages', getChatMessages);

module.exports = router;
