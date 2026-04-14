const Category = require('../models/Category');
const { getNextSequence } = require('../utils/sequence');

async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json(categories);
  } catch (error) {
    return next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, slug } = req.body;
    const id = await getNextSequence('category');
    const category = await Category.create({ id, name, slug });
    return res.status(201).json(category);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Category slug already exists' });
    }
    return next(error);
  }
}

module.exports = { getCategories, createCategory };
