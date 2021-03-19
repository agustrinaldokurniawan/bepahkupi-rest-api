const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cafeSchema = new Schema(
  {
    username: String,
    phone: String,
    hours: String,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("CafeSchema", cafeSchema);
