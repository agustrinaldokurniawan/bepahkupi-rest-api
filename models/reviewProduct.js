const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewProduct = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewProduct);
