const { Router } = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/cloudinary'); // Make sure this path is correct

const Blog = require('../models/blog');
const Comment = require('../models/comment');

const router = Router();

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shayrana_blogs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const upload = multer({ storage: storage });

router.get('/addBlog', (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, content } = req.body;

  try {
    const blog = await Blog.create({
      content,
      title,
      createdBy: req.user._id,
      coverImageURL: req.file.path, // Cloudinary URL
    });
    return res.redirect(`/blog/${blog._id}`);
  } catch (err) {
    console.error("❌ Blog creation error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('createdBy');
    const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');
    return res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
  } catch (err) {
    console.error("❌ Blog fetch error:", err);
    return res.status(404).send("Blog not found");
  }
});

router.post("/comment/:blogId", async (req, res) => {
  try {
    await Comment.create({
      comment: req.body.comment,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (err) {
    console.error("❌ Comment error:", err);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
