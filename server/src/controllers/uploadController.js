const { uploadFile } = require("../services/storageService");

/**
 * @route   POST /api/v1/uploads
 * @desc    Upload a single file (image, document, video)
 * @access  Private (instructor, admin)
 */
const uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Bad Request",
        message: "No file provided in form-data ('file' field required)",
      });
    }

    const folder = req.body.folder || "materials";
    const uploaded = await uploadFile(req.file, folder);

    res.status(201).json({
      message: "File uploaded successfully",
      file: uploaded,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/uploads/batch
 * @desc    Upload multiple files at once
 * @access  Private (instructor, admin)
 */
const uploadBatch = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "No files provided in form-data ('files' field required)",
      });
    }

    const folder = req.body.folder || "materials";
    const uploadedFiles = await Promise.all(
      req.files.map((f) => uploadFile(f, folder))
    );

    res.status(201).json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSingle,
  uploadBatch,
};
