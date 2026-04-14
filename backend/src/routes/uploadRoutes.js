const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/uploadController');
const { ALLOWED_TYPES } = require('../services/imageService');

const router = express.Router();

const maxSizeBytes = (Number(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSizeBytes },
  fileFilter: (req, file, callback) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return callback(new Error('Invalid file type'));
    }
    return callback(null, true);
  }
});

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (error) {
      error.statusCode = 400;
      return next(error);
    }
    return next();
  });
}

router.post(['/upload', '/uploads'], handleUpload, uploadFile);

module.exports = router;
