const express = require("express");
const router = express.Router();

const { checkout, payment } = require("../../controllers/buyer/order");

router.post("/order/checkout", checkout).post("/order/payment", payment);

module.exports = router;
