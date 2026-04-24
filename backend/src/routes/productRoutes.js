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

const productBodyBaseSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  price: z.coerce.number().positive(),
  discountPrice: z.preprocess(
    (value) => {
      if (value === '' || value === undefined) return undefined;
      if (value === null) return null;
      return Number(value);
    },
    z.number().nonnegative().nullable().optional()
  ),
  unit: z.string().trim().min(1).max(30).optional(),
  categoryId: z.coerce.number().int().positive(),
  stock: z.coerce.number().int().nonnegative().optional(),
  imageUrl: z
    .string()
    .trim()
    .refine((value) => value === '' || isHttpUrl(value), {
      message: 'imageUrl must be a valid Cloudinary http(s) URL'
    })
    .optional()
});

function withDiscountValidation(schema) {
  return schema.superRefine((payload, context) => {
    if (
      payload.price !== undefined &&
      payload.discountPrice !== undefined &&
      payload.discountPrice !== null &&
      payload.discountPrice > payload.price
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'discountPrice must be less than or equal to price',
        path: ['discountPrice']
      });
    }
  });
}

const createSchema = z.object({
  body: withDiscountValidation(productBodyBaseSchema),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const updateSchema = z.object({
  body: withDiscountValidation(productBodyBaseSchema.partial()),
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  query: z.object({}).optional()
});

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', authMiddleware, validate(createSchema), createProduct);
router.put('/products/:id', authMiddleware, validate(updateSchema), updateProduct);
router.delete('/products/:id', authMiddleware, deleteProduct);

module.exports = router;
