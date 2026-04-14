const Counter = require('../models/Counter');

async function getNextSequence(name, options = {}) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      ...options
    }
  );

  return counter.seq;
}

module.exports = { getNextSequence };
