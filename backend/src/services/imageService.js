const { randomUUID } = require('crypto');
const { v2: cloudinary } = require('cloudinary');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function isCloudinaryConfigured() {
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET)
  );
}

function getCloudinaryFolder() {
  const folder = process.env.CLOUDINARY_FOLDER;
  if (!folder) {
    return 'malwa';
  }
  return String(folder).trim() || 'malwa';
}

function configureCloudinaryClient() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

function validateImage(file) {
  if (!file) {
    const error = new Error('Image file is required');
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    const error = new Error('Invalid image type. Allowed types are jpeg, png and webp.');
    error.statusCode = 400;
    throw error;
  }

  const maxBytes = (Number(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024;
  if (file.size > maxBytes) {
    const error = new Error('Image exceeds size limit.');
    error.statusCode = 400;
    throw error;
  }
}

async function uploadToCloudinary(file) {
  configureCloudinaryClient();

  return new Promise((resolve, reject) => {
    const publicId = randomUUID();
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: getCloudinaryFolder(),
        resource_type: 'image',
        public_id: publicId,
        overwrite: false
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result?.secure_url) {
          const noUrlError = new Error('Cloudinary upload completed without secure_url');
          noUrlError.statusCode = 502;
          return reject(noUrlError);
        }
        return resolve(result.secure_url);
      }
    );

    upload.end(file.buffer);
  });
}

async function uploadImage(file) {
  validateImage(file);

  if (!isCloudinaryConfigured()) {
    const error = new Error(
      'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.'
    );
    error.statusCode = 500;
    throw error;
  }

  return uploadToCloudinary(file);
}

module.exports = {
  uploadImage,
  validateImage,
  ALLOWED_TYPES
};
