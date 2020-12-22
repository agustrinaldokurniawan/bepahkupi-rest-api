const express = require("express");
const router = express.Router();

const {
  create,
  readAll,
  readByProduct,
  readByUser,
  remove,
} = require("../../controllers/buyer/review");

router
  .post("/review/create", create)
  .get("/review/read-by-user", readByUser)
  .get("/review/read-by-product", readByProduct)
  .get("/review/readAll", readAll)
  .post("/review/remove", remove);

module.exports = router;
