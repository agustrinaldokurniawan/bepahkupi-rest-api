const express = require("express");
const router = express.Router();

const {
  createProduct,
  updateProduct,
  readProduct,
  readProducts,
  deleteProduct,
} = require("../../controllers/admin/product");

router
  .post("/product/create", createProduct)
  .post("/product/update", updateProduct)
  .get("/product/readOne", readProduct)
  .get("/product/readAll", readProducts)
  .post("/product/delete", deleteProduct);

module.exports = router;
