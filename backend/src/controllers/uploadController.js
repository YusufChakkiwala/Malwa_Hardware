const { uploadImage } = require('../services/imageService');

async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const url = await uploadImage(req.file);
    return res.status(201).json({ url });
  } catch (error) {
    return next(error);
  }
}

module.exports = { uploadFile };
