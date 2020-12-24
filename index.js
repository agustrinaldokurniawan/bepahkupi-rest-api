const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var multer = require("multer");
require("dotenv").config();
const morgan = require("morgan");
const CORS = require("cors");

const app = express();

mongoose.connect(
  process.env.MONGODB,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) return console.log(err);
    console.log(`MongoDB is running `);
  }
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan("combined"));
app.use(CORS());

const adminAccountRoutes = require("./routes/admin/account");
const adminProductRoutes = require("./routes/admin/product");

const userAccountRoutes = require("./routes/buyer/account");
const userProductRoutes = require("./routes/buyer/product");
const userCartRoutes = require("./routes/buyer/cart");
const userOrderRoutes = require("./routes/buyer/order");
const userWishlistRoutes = require("./routes/buyer/wishlist");
const userReviewRoutes = require("./routes/buyer/review");

app.use("/admin", adminAccountRoutes, adminProductRoutes);

app.use(
  "/user",
  userAccountRoutes,
  userProductRoutes,
  userCartRoutes,
  userOrderRoutes,
  userWishlistRoutes,
  userReviewRoutes
);

const server = app.listen(process.env.PORT || 8000, (err) => {
  if (err) return console.log(err);
  console.log(`App is running on port ${server.address().port}`);
});
