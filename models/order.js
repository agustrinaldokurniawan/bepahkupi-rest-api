const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    voucher: {
      type: String,
    },
    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
    },
    payment: {
      type: {
        type: String,
      },
      name: {
        type: String,
      },
      response: {
        type: Object,
      },
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
        weight: {
          type: Number,
        },
        cost: {
          type: Number,
        },
        estimation: {
          type: String,
        },
        courier: {
          type: String,
        },
        service: {
          type: String,
        },
        destination_details: {
          city: Object,
          subdistrict: Object,
        },
      },
      resi: {
        type: String,
      },
      status: {
        type: String,
        default: null,
      },
    },
    amount: {
      type: Number,
    },
    status: {
      type: String,
      default: "payment",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
