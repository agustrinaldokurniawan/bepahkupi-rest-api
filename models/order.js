const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    voucher: {
      type: Schema.Types.ObjectId,
      ref: "Voucher",
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
    payment: {
      type: JSON,
    },
    shipping: {
      name: {
        type: String,
      },
      phoneNumber: {
        type: String,
      },
      email: {
        type: String,
      },
      address: {
        type: String,
      },
      courier: {
        type: JSON,
      },
      resi: {
        type: String,
      },
      status: {
        type: String,
      },
    },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
