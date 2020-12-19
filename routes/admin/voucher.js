const express = require("express");
const router = express.Router();

const {
  createVoucher,
  readVoucher,
  readVouchers,
  updateVoucher,
  deleteVoucher,
} = require("../../controllers/admin/voucher");

router
  .post("/voucher/create", createVoucher)
  .post("/voucher/update", updateVoucher)
  .get("/voucher/readOne", readVoucher)
  .get("/voucher/readAll", readVouchers)
  .post("/voucher/delete", deleteVoucher);

module.exports = router;
