const express = require("express");
const { add } = require("numeral");
const router = express.Router();

const {
  checkout,
  payment,
  destinationList,
  shippingMethodList,
  addressList,
  readAllByUser,
  paymentNotif,
} = require("../../controllers/buyer/order");

router
  .post("/order/checkout", checkout)
  .post("/order/payment", payment)
  .get("/order/destination", destinationList)
  .get("/order/address", addressList)
  .get("/order/readAllByUser", readAllByUser)
  .post("/order/paymentNotif", paymentNotif)
  .get("/order/shipping", shippingMethodList);
// .get("/order/citytodb", addCityToDB);

module.exports = router;
