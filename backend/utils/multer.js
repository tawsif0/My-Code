// utils/multer.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./public/home";
    ensureDirectoryExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const dir = "./public/home";

    let finalName = file.originalname;
    let counter = 1;

    while (fs.existsSync(path.join(dir, finalName))) {
      finalName = `${baseName}(${counter})${ext}`;
      counter++;
    }

    cb(null, finalName);
  }
});

// Only accept 'image' field, matching the field in the form
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
  fileFilter: (req, file, cb) => {
    if (
      file.fieldname === "image" && // This must match the field name in FormData
      (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, and .png files are allowed!"));
    }
  }
});

module.exports = upload;
