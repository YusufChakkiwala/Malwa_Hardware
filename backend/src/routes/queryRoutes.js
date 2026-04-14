const express = require('express');
const { z } = require('zod');
const { createQuery, getQueries, updateQueryStatus } = require('../controllers/queryController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { queryLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const querySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().min(8),
    shopName: z.string().optional(),
    message: z.string().min(4),
    imageUrl: z.string().url().or(z.literal('')).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const queryStatusSchema = z.object({
  body: z.object({ status: z.enum(['new', 'open', 'closed']) }),
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  query: z.object({}).optional()
});

router.post('/queries', queryLimiter, validate(querySchema), createQuery);
router.get('/queries', authMiddleware, getQueries);
router.put('/queries/:id/status', authMiddleware, validate(queryStatusSchema), updateQueryStatus);

module.exports = router;
