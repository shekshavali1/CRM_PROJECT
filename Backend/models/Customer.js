const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  status: {
    type: String,
    default: "Lead"
  },

  notes: {
    type: String,
    default: ""
  },

  followUpDate:{
  type:Date
},

image:{
  type:String,
  default:""
}

}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);