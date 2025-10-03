const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary Storage Config
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "properties", // Cloudinary folder name
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// Multer Upload Middleware
const upload = multer({ storage });

module.exports = upload;
