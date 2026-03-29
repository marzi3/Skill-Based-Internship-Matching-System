const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'internmatch';

    if (file.fieldname === 'profileImage') {
      folder = 'internmatch/profile-images';
    } else if (file.fieldname === 'resume') {
      folder = 'internmatch/resumes';
    } else if (file.fieldname === 'companyLogo') {
      folder = 'internmatch/company-logos';
    }

    return {
      folder: folder,
      resource_type: 'auto', // Important for PDF support
      public_id: file.fieldname + '-' + Date.now(),
    };
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed exact MIME types
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|webp|pdf/i;

  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // Check exact mime
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only strict images (JPEG, PNG, GIF) and PDFs are allowed.'));
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
