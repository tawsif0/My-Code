const express = require("express");
const News = require("../models/News");
const NewsCategory = require("../models/NewsCategory");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer storage for news images
const newsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/news");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/news");
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

const newsUpload = multer({
  storage: newsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
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

//  GET all news (pagination optional)
router.get("/", async (req, res) => {
  try {
    const news = await News.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ news }); //  corrected
  } catch (err) {
    res.status(500).json({ message: "Error fetching news" }); // updated message
  }
});

//  GET single news by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const newsItem = await News.findById(id).populate("category", "name");

    if (!newsItem) {
      return res.status(404).json({ message: "News post not found" });
    }

    res.status(200).json({ data: newsItem });
  } catch (err) {
    console.error("Error fetching news:", err);
    res.status(500).json({ message: "Error retrieving news post" });
  }
});
router.get("/related/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 3, exclude } = req.query;

    let query = { category: categoryId };
    if (exclude) {
      query._id = { $ne: exclude };
    }

    const relatedNews = await News.find(query)
      .populate("category", "name")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json(relatedNews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching related news" });
  }
});
//  POST create news
router.post("/", newsUpload.single("image"), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const imageFile = req.file;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "News title is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "News description is required" });
    }
    if (!category) {
      return res.status(400).json({ message: "News category is required" });
    }

    const categoryExists = await NewsCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid news category" });
    }

    const newsData = {
      title: title.trim(),
      description: description.trim(),
      category
    };
    if (imageFile) {
      newsData.image = imageFile.filename;
    }

    const newNews = new News(newsData);
    await newNews.save();
    await newNews.populate("category", "name");

    res.status(201).json({
      message: "News post created successfully",
      news: newNews
    });
  } catch (err) {
    console.error("Error creating news:", err);
    res.status(500).json({ message: "Error creating news post" });
  }
});

//  PUT update news
router.put("/:id", newsUpload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    const imageFile = req.file;

    // Check if news exists
    const newsItem = await News.findById(id);
    if (!newsItem) {
      return res.status(404).json({ message: "News post not found" });
    }

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "News title is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "News description is required" });
    }
    if (!category) {
      return res.status(400).json({ message: "News category is required" });
    }

    const categoryExists = await NewsCategory.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: "Invalid news category" });
    }

    //  Update fields
    newsItem.title = title.trim();
    newsItem.description = description.trim();
    newsItem.category = category;

    //  Handle new image
    if (imageFile) {
      newsItem.image = imageFile.filename;
    }

    await newsItem.save();
    await newsItem.populate("category", "name");

    res.status(200).json({
      message: "News post updated successfully",
      news: newsItem
    });
  } catch (err) {
    console.error("Error updating news:", err);
    res.status(500).json({ message: "Error updating news post" });
  }
});

//  DELETE news
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const newsItem = await News.findById(id);
    if (!newsItem) {
      return res.status(404).json({ message: "News post not found" });
    }

    await News.findByIdAndDelete(id);
    res.status(200).json({ message: "News post deleted successfully" });
  } catch (err) {
    console.error("Error deleting news:", err);
    res.status(500).json({ message: "Error deleting news post" });
  }
});

//  GET news by category
router.get("/category/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const category = await NewsCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const news = await News.find({ category: categoryId })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await News.countDocuments({ category: categoryId });

    res.status(200).json({
      news,
      category: category.name,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalNews: total,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Error fetching news by category:", err);
    res.status(500).json({ message: "Error retrieving news for category" });
  }
});

module.exports = router;
