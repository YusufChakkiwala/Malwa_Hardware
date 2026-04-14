const Query = require('../models/Query');
const { getNextSequence } = require('../utils/sequence');

async function createQuery(req, res, next) {
  try {
    const { name, phone, shopName, message, imageUrl } = req.body;

    const id = await getNextSequence('query');
    const query = await Query.create({
      id,
      name,
      phone,
      shopName: shopName || null,
      message,
      imageUrl: imageUrl || null,
      status: 'new'
    });

    return res.status(201).json(query);
  } catch (error) {
    return next(error);
  }
}

async function getQueries(req, res, next) {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });

    return res.json(queries);
  } catch (error) {
    return next(error);
  }
}

async function updateQueryStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const existing = await Query.findOne({ id }).select('_id');
    if (!existing) {
      return res.status(404).json({ message: 'Query not found' });
    }

    const query = await Query.findByIdAndUpdate(
      existing._id,
      { status },
      { new: true, runValidators: true }
    );
    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    return res.json(query);
  } catch (error) {
    return next(error);
  }
}

module.exports = { createQuery, getQueries, updateQueryStatus };
