const express = require('express');
const { z } = require('zod');
const {
  createOrder,
  getOrderHistory,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const createOrderSchema = z.object({
  body: z.object({
    customerUid: z.string().trim().min(1).optional(),
    customerName: z.string().min(2),
    phone: z.string().min(8),
    address: z.string().min(5),
    city: z.string().min(2),
    items: z
      .array(
        z.object({
          productId: z.coerce.number().int().positive(),
          quantity: z.coerce.number().int().positive()
        })
      )
      .min(1)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const orderHistorySchema = z.object({
  params: z.object({}).optional(),
  body: z.object({}).optional(),
  query: z.object({
    customerUid: z.string().trim().min(1)
  })
});

const updateStatusSchema = z.object({
  body: z.object({ status: z.enum(['pending', 'processing', 'completed', 'cancelled']) }),
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  query: z.object({}).optional()
});

router.post('/orders', validate(createOrderSchema), createOrder);
router.get('/orders/history', validate(orderHistorySchema), getOrderHistory);
router.get('/orders', authMiddleware, getOrders);
router.get('/orders/:id(\\d+)', authMiddleware, getOrderById);
router.put('/orders/:id(\\d+)/status', authMiddleware, validate(updateStatusSchema), updateOrderStatus);

module.exports = router;
