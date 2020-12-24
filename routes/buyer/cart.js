const express = require("express");
const router = express.Router();

const {
  addToCart,
  removeFromCart,
  deleteCart,
  readCart,
  readCarts,
  increaseByQuantity,
  decreasebyQuantity,
} = require("../../controllers/buyer/cart");

const { paymentChannels } = require("../../controllers/buyer/order");

router
  .post("/cart/inc-by-qty", increaseByQuantity)
  .post("/cart/dec-by-qty", decreasebyQuantity)
  .get("/cart/readOne", readCart)
  .get("/cart/readAll", readCarts)
  .post("/cart/delete", deleteCart);

module.exports = router;
