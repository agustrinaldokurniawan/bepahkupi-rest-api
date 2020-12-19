const express = require("express");
const router = express.Router();

const {
  createAccount,
  readAccount,
  readAccounts,
  deleteAccount,
  updateAccount,
  login,
} = require("../../controllers/buyer/account");

router
  .post("/account/create", createAccount)
  .post("/account/update", updateAccount)
  .get("/account/readOne", readAccount)
  .get("/account/readAll", readAccounts)
  .post("/account/delete", deleteAccount)
  .post("/account/login", login);

module.exports = router;
