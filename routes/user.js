const { Router } = require("express");
const User = require("../models/user");
const path = require('path');

const router = Router();

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

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

router.get('/logout', (req, res) => {
  res.clearCookie('token'); // assuming you're using a cookie named "token"
  return res.redirect('/');
});

router.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({
    fullName,
    email,
    password,
  });
  return res.redirect("/");
});

router.get("/profile", async (req, res) => {
  const user = req.user; // Get the logged-in user from the session
  res.render("profile", {
    user,
  });
});


// POST: Update Profile
router.post("/profile", upload.single("profileImage"), async (req, res) => {
  const { fullName, email, password } = req.body;
  const updatedData = {
    fullName,
    email,
  };

  // If a new password is provided, hash it
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    updatedData.password = hashedPassword;
  }

  // If a new profile image is uploaded, update the profileImageURL
  if (req.file) {
    updatedData.profileImageURL = `/uploads/${req.file.filename}`;
  }

  try {
    // Find and update the user's data
    await User.findByIdAndUpdate(req.user._id, updatedData);
    res.redirect("/user/profile"); // Redirect to the profile page after updating
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile");
  }
});

module.exports = router;
