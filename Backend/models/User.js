const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: "CRM SYSTEM"
  },

  adminName: {
    type: String,
    default: "Admin"
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  profileImage: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
