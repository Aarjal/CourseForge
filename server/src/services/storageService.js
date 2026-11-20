const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure local upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

/**
 * Upload a file to active storage (Local Disk or Cloudinary)
 * @param {Object} file - Multer file object
 * @param {string} folder - subfolder or category
 * @returns {Promise<{ url: string, filename: string, size: number, mimetype: string }>}
 */
async function uploadFile(file, folder = "general") {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  if (isCloudinaryConfigured) {
    // Lazy-load cloudinary when configured
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `courseforge/${folder}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            filename: file.originalname,
            size: result.bytes,
            mimetype: file.mimetype,
          });
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  // Local disk fallback
  const ext = path.extname(file.originalname) || "";
  const safeBaseName = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBaseName}${ext}`;
  const filePath = path.join(UPLOAD_DIR, uniqueName);

  await fs.promises.writeFile(filePath, file.buffer);

  return {
    url: `/uploads/${uniqueName}`,
    filename: uniqueName,
    originalName: file.originalname,
    size: file.size || file.buffer.length,
    mimetype: file.mimetype,
  };
}

/**
 * Delete a file from storage
 */
async function deleteFile(filenameOrPublicId) {
  if (isCloudinaryConfigured) {
    const cloudinary = require("cloudinary").v2;
    return cloudinary.uploader.destroy(filenameOrPublicId);
  }

  const filePath = path.join(UPLOAD_DIR, path.basename(filenameOrPublicId));
  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
  }
}

module.exports = {
  uploadFile,
  deleteFile,
  isCloudinaryConfigured,
};
