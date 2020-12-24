const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var multer = require("multer");
require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(cors());

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

const adminAccountRoutes = require("./routes/admin/account");
const adminProductRoutes = require("./routes/admin/product");

const userAccountRoutes = require("./routes/buyer/account");
const userProductRoutes = require("./routes/buyer/product");
const userCartRoutes = require("./routes/buyer/cart");
const userOrderRoutes = require("./routes/buyer/order");
const userWishlistRoutes = require("./routes/buyer/wishlist");
const userReviewRoutes = require("./routes/buyer/review");

app.use("/admin", adminAccountRoutes);
app.use("/admin", adminProductRoutes);

app.use(
  "/user",
  userAccountRoutes,
  userProductRoutes,
  userCartRoutes,
  userOrderRoutes,
  userWishlistRoutes,
  userReviewRoutes
);
app.use("/user", userReviewRoutes);
app.use("/user", userWishlistRoutes);
app.use("/user", userOrderRoutes);
app.use("/user", userCartRoutes);
app.use("/user", userProductRoutes);
app.use("/user", userAccountRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Running on port ${port}`);
});
