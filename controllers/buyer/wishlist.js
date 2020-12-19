const Wishlist = require("../../models/wishlist");
const User = require("../../models/user");
const Product = require("../../models/product");

exports.createWishlist = (req, res) => {
  const { userId, productId } = req.body;

  User.findOne({ _id: userId }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "User not found" });

    Product.findOne({ _id: productId }, (err, docs) => {
      if (err) return res.json(err);

      if (!docs) return res.json({ message: "Product not found" });

      Wishlist.findOne({ user: userId, product: productId }, (err, docs) => {
        if (err) return res.json(err);

        if (docs) {
          docs.status = "active";
          docs.save((err, docs) => {
            if (err) return res.json(err);

            return res.json({ wishlists: docs });
          });
        } else {
          const newWishlist = new Wishlist({
            user: userId,
            product: productId,
          });

          newWishlist.save((err, docs) => {
            if (err) return res.json(err);

            return res.json({ wishlist: docs });
          });
        }
      });
    });
  });
};

exports.readWishlist = (req, res) => {
  const { userId } = req.body;

  User.findOne({ _id: userId }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "User not found" });

    Wishlist.find({ user: userId })
      .populate("user")
      .populate("cart.cart.product")
      .exec((err, docs) => {
        if (err) return res.json(err);

        return res.json({ wishlists: docs });
      });
  });
};

exports.removeWishlist = (req, res) => {
  const { userId, productId } = req.body;

  Wishlist.findOne({ user: userId, product: productId }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Wishlist not found" });

    docs.status = "inactive";
    docs.save((err, docs) => {
      if (err) return res.json(err);

      return res.json({ wishlists: docs });
    });
  });
};
