const express = require('express');
const { z } = require('zod');
const { login } = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    password: z.string().min(6)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

router.post('/admin/login', validate(loginSchema), login);

module.exports = router;
