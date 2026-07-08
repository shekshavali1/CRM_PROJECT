const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const multer = require("multer");
const path = require("path");
const verifyToken = require("../middleware/authMiddleware");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");   // folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });


// ===============================
// GET ALL CUSTOMERS
// ===============================
router.get("/", async (req, res) => {
  try {

    const customers = await Customer.find();

    res.json(customers);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
});
router.get("/followups/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const customers = await Customer.find({
      followUpDate: {
        $gte: today,
        $lt: tomorrow
      }
    });

    res.json(customers);

  } catch (err) {
    res.status(500).json(err);
  }
});

// ===============================
// TEST DATABASE
// ===============================
router.get("/test-db", async (req, res) => {
  try {

    const customers = await Customer.find();

    res.json({
      success: true,
      count: customers.length,
      data: customers
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
});

// ===============================
// CUSTOMER STATS
// ===============================
router.get("/stats", async (req, res) => {
  try {

    const total = await Customer.countDocuments();

    const lead = await Customer.countDocuments({
      status: "Lead"
    });

    const contacted = await Customer.countDocuments({
      status: "Contacted"
    });

    const qualified = await Customer.countDocuments({
      status: "Qualified"
    });

    const customer = await Customer.countDocuments({
      status: "Customer"
    });

    res.json({
      total,
      lead,
      contacted,
      qualified,
      customer
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
});

// ===============================
// UPDATE CUSTOMER
// ===============================
router.put("/:id", verifyToken, async (req, res) => {

  try {

    const updated =
      await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    if (!updated) {

      return res.status(404).json({
        message: "Customer not found"
      });

    }

    res.json(updated);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

// ===============================
// DELETE CUSTOMER
// ===============================
router.delete("/:id", verifyToken, async (req, res) => {

  try {

    const deleted =
      await Customer.findByIdAndDelete(
        req.params.id
      );

    if (!deleted) {

      return res.status(404).json({
        message: "Customer not found"
      });

    }

    res.json({
      message: "Customer deleted successfully"
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});

// ===============================
// GET SINGLE CUSTOMER
// MUST BE LAST
// ===============================
router.get("/:id", verifyToken, async (req, res) => {

  try {

    const customer =
      await Customer.findById(
        req.params.id
      );

    if (!customer) {

      return res.status(404).json({
        message: "Customer not found"
      });

    }

    res.json(customer);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

});
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    try {

      console.log("🔥 TOKEN USER:", req.user);
      console.log("📦 BODY:", req.body);
      console.log("🖼 FILE:", req.file);

      const customer = new Customer({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        status: req.body.status,
        notes: req.body.notes,
        followUpDate: req.body.followUpDate,
        image: req.file ? req.file.filename : ""
      });

      await customer.save();

      res.status(201).json(customer);

    } catch (err) {
      console.log("❌ ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);
// =========================
// BACKUP DATABASE
// =========================

router.get("/backup", verifyToken, async (req, res) => {

    try {

        const customers = await Customer.find();

        res.json(customers);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});
// =========================
// RESTORE DATABASE
// =========================

router.post("/restore", verifyToken, async (req, res) => {

    try {

        await Customer.deleteMany({});

        await Customer.insertMany(req.body);

        res.json({
            message: "Database Restored Successfully"
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

});
module.exports = router;