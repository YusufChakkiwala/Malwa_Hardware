const express = require('express');
const { z } = require('zod');
const { getCategories, createCategory } = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    slug: z.string().min(2)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

router.get('/categories', getCategories);
router.post('/categories', authMiddleware, validate(createCategorySchema), createCategory);

module.exports = router;
