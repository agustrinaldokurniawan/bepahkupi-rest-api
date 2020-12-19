const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    type: [
      {
        type: String,
      },
    ],
    groundLevel: [
      {
        type: String,
      },
    ],
    price: [
      {
        weight: {
          type: Number,
        },
        price: {
          type: Number,
        },
        discount: {
          type: Number,
          default: 0,
        },
      },
    ],
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
