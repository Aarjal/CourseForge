const multer = require("multer");

// Use memory storage so file buffers can be processed or routed to Cloudinary / local disk
const storage = multer.memoryStorage();

const allowedMimes = [
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  // Documents
  "application/pdf",
  "application/zip",
  "text/plain",
  "text/markdown",
  // Videos
  "video/mp4",
  "video/webm",
  "video/ogg",
];

function fileFilter(req, file, cb) {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Unsupported file type: ${file.mimetype}. Allowed types include images, PDFs, markdown, and videos.`
    );
    error.status = 400;
    cb(error, false);
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter,
});

module.exports = upload;
