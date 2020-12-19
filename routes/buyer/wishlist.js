const express = require("express");
const router = express.Router();

const {
  createWishlist,
  readWishlist,
  removeWishlist,
} = require("../../controllers/buyer/wishlist");

router
  .post("/wishlist/create", createWishlist)
  .post("/wishlist/remove", removeWishlist)
  .get("/wishlist/readOne", readWishlist);

module.exports = router;
