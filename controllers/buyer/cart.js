const Cart = require("../../models/cart");
const Product = require("../../models/product");

const arrayFindIndex = require("array-find-index");

exports.increaseByQuantity = (req, res) => {
  const {
    userId,
    productId,
    weight,
    type,
    groundLevel,
    price,
    quantity,
  } = req.body;

  Cart.findOne({ user: userId, status: "active" })
    .populate("user")
    .populate("cart.cart.product")
    .exec(async (err, docs) => {
      if (err) return res.json(err);

      if (!docs) {
        const newCart = new Cart({
          user: userId,
          cart: {
            cart: {
              product: productId,
              weight,
              type,
              groundLevel,
              price,
              quantity,
            },
            totalPrice: price * quantity,
          },
        });

        newCart.save((err, docs) => {
          if (err) return res.json(err);

          // console.log({ docs });

          return res.json({ cart: docs });
        });
      } else {
        let index = -1;
        if (type && groundLevel) {
          index = arrayFindIndex(
            docs.cart.cart,
            (x) =>
              x.product._id.toString() === productId.toString() &&
              x.weight === weight &&
              x.type === type &&
              x.groundLevel == groundLevel
          );
        } else {
          index = arrayFindIndex(
            docs.cart.cart,
            (x) =>
              x.product._id.toString() === productId.toString() &&
              x.weight === weight
          );
        }

        if (index > -1) {
          docs.cart.cart[index].quantity += quantity;
          docs.cart.totalPrice += quantity * price;
        } else {
          docs.cart.cart.push({
            product: productId,
            weight,
            type,
            groundLevel,
            price,
          });
          docs.cart.totalPrice += quantity * price;
        }

        // return res.json({ index });

        docs.save((err, docs) => {
          if (err) return res.json(err);

          // console.log({ docs });

          return res.json({ cart: docs });
        });
      }
    });
};

exports.decreasebyQuantity = (req, res) => {
  const {
    userId,
    productId,
    weight,
    type,
    groundLevel,
    quantity,
    price,
  } = req.body;

  Cart.findOne({ user: userId, status: "active" })
    .populate("user")
    .populate("cart.cart.product")
    .exec(async (err, docs) => {
      if (err) return res.json(err);

      if (!docs) {
        return res.json({ message: "Cart not found" });
      } else {
        let index = -1;
        if (type && groundLevel) {
          index = arrayFindIndex(
            docs.cart.cart,
            (x) =>
              x.product._id.toString() === productId.toString() &&
              x.weight === weight &&
              x.type === type &&
              x.groundLevel == groundLevel
          );
        } else {
          index = arrayFindIndex(
            docs.cart.cart,
            (x) =>
              x.product._id.toString() === productId.toString() &&
              x.weight === weight
          );
        }

        if (index > -1) {
          docs.cart.cart[index].quantity -= quantity;
          docs.cart.totalPrice -= quantity * price;

          if (docs.cart.cart[index].quantity < 1) {
            docs.cart.cart.id(docs.cart.cart[index]._id).remove();
          }
        }

        // return res.json({ index });

        docs.save((err, docs) => {
          if (err) return res.json(err);
          return res.json({ cart: docs });
        });
      }
    });
};

exports.removeFromCart = (req, res) => {};

exports.addOneToCart = (req, res) => {};

exports.readCart = (req, res) => {
  const { userId } = req.query;

  console.log({ data: req.paymentChannels });

  Cart.findOne({ user: userId, status: "active" })
    .populate("user")
    .populate("cart.cart.product")
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

exports.deleteCart = (req, res) => {
  res.send("Create");
};
