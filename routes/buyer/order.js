const express = require("express");
const { add } = require("numeral");
const router = express.Router();

const {
  checkout,
  paymentFVA,
  destinationList,
  shippingMethodList,
  addressList,
  readAllByUser,
  paymentNotifCreatedFVA,
  paymentNotifPaidFVA,
  paymentChannels,
  paymentEwallet,
  paymentNotifCreatedEwallet,
  paymentNotifPaidEwallet,
  payment,
  readAll,
  updateOrder,
} = require("../../controllers/buyer/order");

router
  .post("/order/checkout", checkout)
  .get("/order/destination", destinationList)
  .get("/order/payment-channels", paymentChannels)
  .get("/order/address", addressList)
  .get("/order/readAllByUser", readAllByUser)
  .get("/order/readAll", readAll)
  .post("/order/updateOrder", updateOrder)
  .post("/order/payment", payment)
  // .post("/order/paymentFVA", paymentFVA)
  .post("/order/paymentNotifCreatedFVA", paymentNotifCreatedFVA)
  .post("/order/paymentNotifPaidFVA", paymentNotifPaidFVA)
  .post("/order/paymentEwallet", paymentEwallet)
  .post("/order/paymentNotifCreatedEwallet", paymentNotifCreatedEwallet)
  .post("/order/paymentNotifPaidEwallet", paymentNotifPaidEwallet)
  .get("/order/shipping", shippingMethodList);
// .get("/order/citytodb", addCityToDB);

module.exports = router;
