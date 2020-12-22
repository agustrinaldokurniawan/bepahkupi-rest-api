const express = require("express");
const router = express.Router();

const {
  createAccount,
  readAccount,
  readAccounts,
  deleteAccount,
  updateAccount,
  login,
  forgotPassword,
  changePassword,
} = require("../../controllers/buyer/account");

router
  .post("/account/create", createAccount)
  .post("/account/update", updateAccount)
  .get("/account/readOne", readAccount)
  .get("/account/readAll", readAccounts)
  .post("/account/delete", deleteAccount)
  .post("/account/forgot-password", forgotPassword)
  .post("/account/change-password", changePassword)
  .post("/account/login", login);

module.exports = router;
