const Cart = require("../../models/cart");
const Product = require("../../models/product");

exports.addToCart = (req, res) => {
  const { userId, cart } = req.body;

  Cart.findOne({ user: userId, status: "active" }, async (err, docs) => {
    if (err) return res.json(err);

    if (docs) {
      for (let i in cart) {
        const index = docs.cart.findIndex(
          (obj) =>
            obj.weight == cart[i].weight &&
            obj.type == cart[i].type &&
            obj.groundLevel == cart[i].groundLevel
        );
        if (index > -1) {
          docs.cart[index].quantity += cart[i].quantity;
        } else {
          docs.cart.push(cart[i]);
        }
      }

      // return res.json({ cart: docs });
      docs.save((err, docs) => {
        if (err) return res.json(err);

        return res.json({ cart: docs });
      });
    } else {
      const newCart = new Cart({
        user: userId,
        cart,
      });

      // return res.json({ newCart });
      newCart.save((err, docs) => {
        if (err) return res.json(err);

        return res.json({ cart: docs });
      });
    }
  });
};

exports.readCart = (req, res) => {
  const { userId } = req.query;

  Cart.findOne({ user: userId, status: "active" })
    .populate("user")
    .populate("cart.product")
    .exec((err, docs) => {
      if (err) return res.json(err);

      if (!docs) return res.json({ message: "No active cart" });

      return res.json({ cart: docs });
    });
};

exports.readCarts = (req, res) => {
  Cart.find({})
    .populate("user")
    .populate("cart.product")
    .exec((err, docs) => {
      if (err) return res.json(err);

      if (!docs) return res.json({ message: "No cart" });

      return res.json({ carts: docs });
    });
};

exports.removeFromCart = (req, res) => {
  const { userId, cart } = req.body;

  Cart.findOne({ user: userId, status: "active" }, async (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "No active cart" });

    if (docs) {
      for (let i in cart) {
        const index = docs.cart.findIndex(
          (obj) =>
            obj.weight == cart[i].weight &&
            obj.type == cart[i].type &&
            obj.groundLevel == cart[i].groundLevel
        );
        if (index > -1) {
          docs.cart[index].quantity -= cart[i].quantity;
        }
        if (docs.cart[index].quantity < 1) {
          docs.cart.pull({ _id: docs.cart[index]._id });
        }
      }

      // return res.json({ cart: docs });
      docs.save((err, docs) => {
        if (err) return res.json(err);

        return res.json({ cart: docs });
      });
    }
  });
};
exports.deleteCart = (req, res) => {
  res.send("Create");
};
