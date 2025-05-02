const { Router } = require("express");
const User = require("../models/user");
const multer = require("multer");
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../utils/cloudinary');
const requireUser = require("../middleware/requireUser");

const router = Router();

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shayrana_users',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const upload = multer({ storage: storage });

// GET: Signin Page
router.get("/signin", (req, res) => {
  res.render("signin");
});

// GET: Signup Page
router.get("/signup", (req, res) => {
  res.render("signup");
});

// POST: Signin
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

// GET: Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.redirect('/');
});

// POST: Signup
router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const user = await User.create({
      fullName,
      email,
      password,
      profileImageURL: req.file?.path || '',
    });

    const token = user.generateJWT();
    return res.cookie("token", token).redirect("/");
  } catch (err) {
    console.error(err);
    return res.render("signup", { error: "Signup failed. Please try again." });
  }
});

// GET: Profile Page (Protected)
router.get("/profile", requireUser, async (req, res) => {
  const user = req.user;
  res.render("profile", { user });
});

module.exports = router;
