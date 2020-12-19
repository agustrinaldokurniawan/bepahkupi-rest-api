const express = require("express");
const router = express.Router();

const {
  addToCart,
  removeFromCart,
  deleteCart,
  readCart,
  readCarts,
} = require("../../controllers/buyer/cart");

router
  .post("/cart/add-to-cart", addToCart)
  .post("/cart/remove-from-cart", removeFromCart)
  .get("/cart/readOne", readCart)
  .get("/cart/readAll", readCarts)
  .post("/cart/delete", deleteCart);

module.exports = router;
