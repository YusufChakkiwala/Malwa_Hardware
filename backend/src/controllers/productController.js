const Category = require('../models/Category');
const Product = require('../models/Product');
const { getNextSequence } = require('../utils/sequence');

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeImageUrl(imageUrl) {
  if (imageUrl === undefined) {
    return undefined;
  }

  if (imageUrl === null) {
    return null;
  }

  const trimmed = String(imageUrl).trim();
  if (!trimmed) {
    return null;
  }

  if (/^[a-zA-Z]:\\/.test(trimmed) || trimmed.startsWith('\\\\')) {
    const error = new Error('imageUrl must be a Cloudinary URL');
    error.statusCode = 400;
    throw error;
  }

  if (/^\/?uploads\/.+/.test(trimmed)) {
    const error = new Error('Local upload paths are not supported. Use Cloudinary URL.');
    error.statusCode = 400;
    throw error;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('invalid-protocol');
    }
    return trimmed;
  } catch {
    const error = new Error('imageUrl must be a valid http(s) Cloudinary URL');
    error.statusCode = 400;
    throw error;
  }
}

async function buildProductFilters(queryText, categoryInput) {
  const filters = [];
  const q = String(queryText || '').trim();
  const category = String(categoryInput || '').trim();

  if (q) {
    const regex = new RegExp(escapeRegex(q), 'i');
    filters.push({
      $or: [{ name: regex }, { description: regex }]
    });
  }

  if (category) {
    const categoryFilters = [];

    if (/^\d+$/.test(category)) {
      categoryFilters.push({ categoryId: Number(category) });
    }

    const categoryBySlug = await Category.findOne({
      slug: new RegExp(`^${escapeRegex(category)}$`, 'i')
    });

    if (categoryBySlug) {
      categoryFilters.push({ categoryId: categoryBySlug.id });
    }

    if (categoryFilters.length === 0) {
      return { id: null };
    }

    filters.push(categoryFilters.length === 1 ? categoryFilters[0] : { $or: categoryFilters });
  }

  return filters.length ? { $and: filters } : {};
}

async function getProducts(req, res, next) {
  try {
    const { q = '', category = '', page = 1, limit = 12 } = req.query;
    const pageNumber = toNumber(page, 1);
    const limitNumber = Math.min(toNumber(limit, 12), 100);
    const filters = await buildProductFilters(q, category);

    const [products, total] = await Promise.all([
      Product.find(filters)
        .populate('category')
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .sort({ createdAt: -1 }),
      Product.countDocuments(filters)
    ]);

    return res.json({
      data: products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const product = await Product.findOne({ id }).populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, slug, description, price, categoryId, stock, imageUrl } = req.body;
    const normalizedImageUrl = normalizeImageUrl(imageUrl);

    const category = await Category.findOne({ id: Number(categoryId) });
    if (!category) {
      return res.status(400).json({ message: 'Invalid categoryId' });
    }

    const id = await getNextSequence('product');
    const created = await Product.create({
      id,
      name,
      slug,
      description,
      price: Number(price),
      categoryId: Number(categoryId),
      stock: Number(stock),
      imageUrl: normalizedImageUrl
    });

    const product = await Product.findOne({ id: created.id }).populate('category');
    return res.status(201).json(product);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Slug already exists' });
    }
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { name, slug, description, price, categoryId, stock, imageUrl } = req.body;
    const normalizedImageUrl = normalizeImageUrl(imageUrl);

    if (categoryId !== undefined) {
      const category = await Category.findOne({ id: Number(categoryId) });
      if (!category) {
        return res.status(400).json({ message: 'Invalid categoryId' });
      }
    }

    const existing = await Product.findOne({ id }).select('_id');
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findByIdAndUpdate(
      existing._id,
      {
        ...(name !== undefined ? { name } : {}),
        ...(slug !== undefined ? { slug } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(categoryId !== undefined ? { categoryId: Number(categoryId) } : {}),
        ...(stock !== undefined ? { stock: Number(stock) } : {}),
        ...(normalizedImageUrl !== undefined ? { imageUrl: normalizedImageUrl } : {})
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('category');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Slug already exists' });
    }
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await Product.findOne({ id }).select('_id');
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const deleted = await Product.findByIdAndDelete(existing._id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
