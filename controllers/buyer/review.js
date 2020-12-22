const Product = require("../../models/product");
const User = require("../../models/user");
const Review = require("../../models/reviewProduct");

exports.create = (req, res) => {
  const { userId, productId, rating, comment } = req.body;

  User.findById(userId, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "User not found" });

    Product.findById(productId, (err, docs) => {
      if (err) return res.json(err);

      if (!docs) return res.json({ message: "Product not found" });

      const newReview = new Review({
        author: userId,
        product: productId,
        rating,
        comment,
      });

      newReview.save((err, docs) => {
        if (err) return res.json(err);

        return res.json({ review: docs });
      });
    });
  });
};

exports.readByUser = (req, res) => {
  const { userId } = req.query;

  Review.find({ author: userId })
    .populate("author")
    .populate("product")
    .exec((err, docs) => {
      if (err) return res.json(err);

      return res.json({ reviews: docs });
    });
};

exports.readByProduct = (req, res) => {
  const { productId } = req.query;

  Review.find({ product: productId })
    .populate("author")
    .populate("product")
    .exec((err, docs) => {
      if (err) return res.json(err);

      return res.json({ reviews: docs });
    });
};

exports.readAll = (req, res) => {
  Review.find({}, (err, docs) => {
    if (err) return res.json(err);

    return res.json({ reviews: docs });
  });
};

exports.remove = (req, res) => {
  const { userId, productId } = req.body;

  Review.find({ author: userId, product: productId }, (err, docs) => {
    if (err) return res.json(err);
    docs.status = "deleted";

    docs.save((err, docs) => {
      if (err) return res.json(err);

      return res.json({ reviews: docs });
    });
  });
};
