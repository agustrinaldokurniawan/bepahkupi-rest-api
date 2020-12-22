const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    cart: {
      cart: [
        {
          product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
          },
          weight: {
            type: Number,
          },
          type: {
            type: String,
          },
          groundLevel: {
            type: String,
          },
          price: {
            type: Number,
          },
          quantity: {
            type: Number,
            default: 1,
          },
        },
      ],
      totalPrice: {
        type: Number,
      },
    },
    status: {
      type: String,
      default: "active",
    },
    onProgress: {
      type: String,
      default: "cart",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
