const express = require("express");
const Blog = require("../models/Blog");
const BlogCategory = require("../models/BlogCategory");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// --- Multer Storage (blogs folder) ---
const blogStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/blogs");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/blogs");
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);

    let finalName = file.originalname;
    let counter = 1;

    while (fs.existsSync(path.join(uploadPath, finalName))) {
      finalName = `${baseName}(${counter})${ext}`;
      counter++;
    }

    cb(null, finalName);
  }
});

const upload = multer({
  storage: blogStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (JPEG, JPG, PNG, GIF, WebP)"));
    }
  }
});

// --- Routes ---

// Create Blog
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category || !req.file) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const categoryExists = await BlogCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const blog = new Blog({
      title,
      content,
      category,
      image: req.file.filename
    });

    await blog.save();
    res.status(201).json({ message: "Blog created successfully", blog });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: "Error creating blog" });
  }
});

// Get all Blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blogs" });
  }
});

// Get single Blog
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blog" });
  }
});

// Get related blogs by category
router.get("/related/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 3, exclude } = req.query;

    let query = { category: categoryId };
    if (exclude) {
      query._id = { $ne: exclude };
    }

    const relatedBlogs = await Blog.find(query)
      .populate("category", "name")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json(relatedBlogs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching related blogs" });
  }
});

// Update Blog
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (req.file) blog.image = req.file.filename;

    await blog.save();
    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (err) {
    res.status(500).json({ message: "Error updating blog" });
  }
});

// Delete Blog
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting blog" });
  }
});

module.exports = router;
