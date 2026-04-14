const express = require('express');
const { z } = require('zod');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const productBodySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  price: z.coerce.number().positive(),
  categoryId: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().nonnegative(),
  imageUrl: z
    .string()
    .trim()
    .refine((value) => value === '' || isHttpUrl(value), {
      message: 'imageUrl must be a valid Cloudinary http(s) URL'
    })
    .optional()
});

const createSchema = z.object({
  body: productBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateSchema = z.object({
  body: productBodySchema.partial(),
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  query: z.object({}).optional()
});

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', authMiddleware, validate(createSchema), createProduct);
router.put('/products/:id', authMiddleware, validate(updateSchema), updateProduct);
router.delete('/products/:id', authMiddleware, deleteProduct);

module.exports = router;
