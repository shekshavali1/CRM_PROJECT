const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const verifyToken = require("./middleware/authMiddleware");

const Customer = require("./models/Customer");
const User = require("./models/User");
const customerRoutes = require("./routes/customerRoutes");
const multer = require("multer");

const app = express();
const SECRET_KEY = "crm_secret_key";

/* MIDDLEWARE */
app.use(cors({
    origin: "http://127.0.0.1:5500",
    credentials: true
}));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* MONGODB */
mongoose.connect("mongodb://127.0.0.1:27017/crmproject")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


  const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, "profile-" + Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


/* ROUTES */
app.use("/api/customers", customerRoutes);

/* SIGNUP */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      adminName: name,
      email,
      password: hashedPassword,
      companyName: "CRM SYSTEM"
    });

    await newUser.save();
    res.status(201).json({ message: "Account created successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    let isMatch = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET PROFILE */
app.get("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE PROFILE */
app.put("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const { companyName, adminName, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (companyName !== undefined) user.companyName = companyName;
    if (adminName !== undefined) user.adminName = adminName;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({
      message: "Profile updated successfully",
      user: {
        companyName: user.companyName,
        adminName: user.adminName,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE PROFILE IMAGE */
app.put(
  "/api/users/profile/image",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      user.profileImage = req.file.filename;

      await user.save();

      res.json({
        message: "Profile image updated",
        image: user.profileImage
      });

    } catch (err) {

      res.status(500).json({
        message: err.message
      });

    }
  }
);

/* START */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});