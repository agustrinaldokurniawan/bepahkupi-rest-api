const Order = require("../../models/order");
const User = require("../../models/user");
const orderid = require("order-id")("mysecret");

const midtransClient = require("midtrans-client");
const { response } = require("express");
let core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY_TEST,
  clientKey: process.env.MIDTRANS_CLIENT_KEY_TEST,
});

exports.checkout = (req, res) => {
  const { userId, cartId, voucher } = req.body;

  User.findOne({ _id: userId, status: "active" }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.status(403).json({ message: "User not found" });

    const newOrder = new Order({
      user: userId,
      cart: cartId,
      voucher,
    });

    // return res.json({ newOrder });

    newOrder.save((err, docs) => {
      if (err) return res.json(err);

      return res.json({ order: docs });
    });
  });
};

exports.payment = (req, res) => {
  const { userId, orderId, payment, shipping } = req.body;

  User.findOne({ _id: userId, status: "active" }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.status(403).json({ message: "User not found" });

    Order.findOne({ _id: orderId })
      .populate("user")
      .populate("voucher")
      .populate({
        path: "cart",
        model: "Cart",
        populate: { path: "cart.product", model: "Product" },
      })
      .exec(async (err, docs) => {
        if (err) return res.json(err);

        if (!docs) return res.status(403).json({ message: "Order not found" });

        // return res.json({ order: docs });
        const user = docs.user;

        let totalPrice = 0;
        for (let i in docs.cart.cart) {
          let price = docs.cart.cart[i].product.price;
          let product = docs.cart.cart[i];
          let index = price.findIndex((obj) => obj.weight == product.weight);

          totalPrice =
            totalPrice +
            (price[index].price - price[index].discount) *
              docs.cart.cart[i].quantity;
        }

        let parameter = {
          payment_type: payment.type,
          bank_transfer: {
            bank: payment.name,
            free_text: {
              payment: [
                {
                  id: "Bepahkupi Store",
                  en: "Bepahkupi Store",
                },
              ],
            },
          },
          transaction_details: {
            gross_amount: totalPrice + shipping.courier.cost.cost[0].value,
            order_id: orderid.generate(),
          },
          customer_details: {
            first_name: user.name,
            email: user.email,
            phone: shipping.phoneNumber,
            billing_address: {
              first_name: shipping.name,
              email: shipping.email,
              phone: shipping.phoneNumber,
              address: shipping.address,
              city: shipping.courier.destination_details.city_name,
              postal_code: shipping.courier.destination_details.postal_code,
            },
          },
        };

        // charge transaction

        //   console.log(parameter);
        core.charge(parameter).then((chargeResponse) => {
          return res.json({ response: chargeResponse });
        });
      });
  });
};
