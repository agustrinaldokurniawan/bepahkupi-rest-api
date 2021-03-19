const express = require("express");
const router = express.Router();

const { createFromFile, reads, read } = require("../../controllers/buyer/cafe");

router
  .get("/kafe/createFromFiles", createFromFile)
  .get("/kafe/reads", reads)
  .get("/kafe/read", read);

module.exports = router;
