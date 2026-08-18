const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "job-tracker-resumes",
    resource_type: "raw", // needed for PDFs/docs, not just images
    allowed_formats: ["pdf", "doc", "docx"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF and Word documents are allowed"));
  },
});

module.exports = upload;