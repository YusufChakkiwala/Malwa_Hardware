const FAQ = require('../models/FAQ');

function toFaqItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.faqs)) {
    return payload.faqs;
  }

  return [payload];
}

function normalizeFaqItem(item, index) {
  const question = String(item?.question ?? '').trim();
  const answer = String(item?.answer ?? '').trim();

  if (!question || !answer) {
    const error = new Error(`Invalid FAQ at index ${index}: question and answer are required`);
    error.statusCode = 400;
    throw error;
  }

  return { question, answer };
}

// GET all FAQs
exports.getFAQs = async (req, res, next) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    return res.json(faqs);
  } catch (error) {
    return next(error);
  }
};

// CREATE FAQ (single or bulk)
exports.createFAQ = async (req, res, next) => {
  try {
    const rawItems = toFaqItems(req.body);
    if (!rawItems.length) {
      return res.status(400).json({ message: 'At least one FAQ is required' });
    }

    const items = rawItems.map(normalizeFaqItem);

    if (items.length === 1) {
      const faq = await FAQ.create(items[0]);
      return res.status(201).json(faq);
    }

    const createdFaqs = await FAQ.insertMany(items);
    return res.status(201).json(createdFaqs);
  } catch (error) {
    return next(error);
  }
};

// DELETE FAQ
exports.deleteFAQ = async (req, res, next) => {
  try {
    const deleted = await FAQ.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    return res.json({ message: 'FAQ deleted' });
  } catch (error) {
    return next(error);
  }
};
