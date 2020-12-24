const midtransClient = require("midtrans-client");

// let core = new midtransClient.CoreApi();

// core.apiConfig.set({
//   isProduction: true,
//   serverKey: process.env.MIDTRANS_SERVER_KEY,
//   clientKey: process.env.MIDTRANS_CLIENT_KEY,
// });

exports.payment = (req, res) => {
  const { userId, cartId, payment, shipping, promoCode } = req.body;

  User.findOne({ _id: userId, status: "active" }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.status(403).json({ message: "User not found" });

    Cart.findOne({ _id: cartId })
      .populate("user")
      .populate({
        path: "cart",
        model: "Cart",
        populate: { path: "cart.product", model: "Product" },
      })
      .exec(async (err, docs) => {
        if (err) return res.json(err);

        if (!docs) return res.status(403).json({ message: "Cart not found" });

        let amount = docs.cart.totalPrice;

        if (promoCode) {
          Voucher.findOne({ code: promoCode }, (err, docs) => {
            if (er) return res.json(err);

            if (docs) {
              amount -= docs.value;
            }
          });
        }

        let parameter = {};

        if (payment.type == "gopay") {
          parameter = {
            payment_type: payment.type,
            transaction_details: {
              gross_amount: docs.cart.totalPrice + shipping.courier.cost,
              order_id: orderid.generate(),
            },
            customer_details: {
              first_name: shipping.name,
              email: shipping.email,
              phone: shipping.phoneNumber,
              billing_address: {
                first_name: shipping.name,
                email: shipping.email,
                phone: shipping.phoneNumber,
                address: shipping.address,
                destination_details: shipping.destination_details,
              },
            },
          };
        } else {
          parameter = {
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
              gross_amount: docs.cart.totalPrice + shipping.courier.cost,
              order_id: orderid.generate(),
            },
            customer_details: {
              first_name: shipping.name,
              email: shipping.email,
              phone: shipping.phoneNumber,
              billing_address: {
                first_name: shipping.name,
                email: shipping.email,
                phone: shipping.phoneNumber,
                address: shipping.address,
                destination_details: shipping.destination_details,
              },
            },
          };
        }
        core.charge(parameter).then((chargeResponse) => {
          const newOrder = new Order({
            user: userId,
            cart: cartId,
            voucher: promoCode,
            shipping: {
              name: shipping.name,
              email: shipping.email,
              phoneNumber: shipping.phoneNumber,
              address: shipping.address,
              courier: {
                weight: shipping.courier.weight,
                estimation: shipping.courier.estimation,
                courier: shipping.courier.courier,
                service: shipping.courier.service,
                cost: shipping.courier.cost,
                destination_details: shipping.destination_details,
              },
            },
            payment: {
              type: payment.type,
              name: payment.name,
              response: chargeResponse,
            },
            amount: amount + shipping.courier.cost,
          });

          // console.log(newOrder);

          // return res.json({ order: newOrder });

          docs.status = "finish";

          docs.save((err) => {
            if (err) return res.json(err);

            newOrder.save((err, docs) => {
              if (err) return res.json(err);

              return res.json({ order: docs });
            });
          });
        });
      });
  });
};
