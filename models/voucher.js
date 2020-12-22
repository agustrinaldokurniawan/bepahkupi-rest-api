const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voucherSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    rating: {
      type: Number,
    },
    comment: {
      type: String,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);
