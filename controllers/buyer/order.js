const Order = require("../../models/order");
const User = require("../../models/user");
const Cart = require("../../models/cart");
const Destination = require("../../models/destination");
const Voucher = require("../../models/voucher");
const orderid = require("order-id")("mysecret");

const MyNumeral = require("numeral");

const request = require("request");

var RajaOngkir = require("rajaongkir-nodejs").Pro(process.env.RAJA_ONGKIR);

const midtransClient = require("midtrans-client");

// let core = new midtransClient.CoreApi();

// core.apiConfig.set({
//   isProduction: true,
//   serverKey: process.env.MIDTRANS_SERVER_KEY,
//   clientKey: process.env.MIDTRANS_CLIENT_KEY,
// });

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

        // console.log(parameter);

        // return res.json({ order: newOrder });

        request(
          {
            uri: "https://api.midtrans.com/v2/charge",
            method: "POST",
            headers: {
              Accept: "application/json",
              Authorization: `Basic TWlkLXNlcnZlci14bWVPYkxWSnVURlpTbXhGRnN5RDd3czg6`,
              "Content-Type": "application/json",
            },
            json: parameter,
          },
          (error, response, body) => {
            if (err) return res.json(err);
            console.log(body);
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
                response: body,
              },
              amount: amount + shipping.courier.cost,
            });

            newOrder.save((err, docs) => {
              if (err) return res.json(err);

              return res.json({ order: docs });
            });
          }
        );

        // core.charge(parameter).then((chargeResponse) => {
        //   const newOrder = new Order({
        //     user: userId,
        //     cart: cartId,
        //     voucher: promoCode,
        //     shipping: {
        //       name: shipping.name,
        //       email: shipping.email,
        //       phoneNumber: shipping.phoneNumber,
        //       address: shipping.address,
        //       courier: {
        //         weight: shipping.courier.weight,
        //         estimation: shipping.courier.estimation,
        //         courier: shipping.courier.courier,
        //         service: shipping.courier.service,
        //         cost: shipping.courier.cost,
        //         destination_details: shipping.destination_details,
        //       },
        //     },
        //     payment: {
        //       type: payment.type,
        //       name: payment.name,
        //       response: chargeResponse,
        //     },
        //     amount: amount + shipping.courier.cost,
        //   });

        //   // console.log(newOrder);

        //   // return res.json({ order: newOrder });

        //   docs.status = "finish";

        //   docs.save((err) => {
        //     if (err) return res.json(err);

        //     newOrder.save((err, docs) => {
        //       if (err) return res.json(err);

        //       return res.json({ order: docs });
        //     });
        //   });
        // });
      });
  });
};

exports.destinationList = (req, res) => {
  RajaOngkir.getCities()
    .then(function (result) {
      let arr = [];
      for (let i in result.rajaongkir.results) {
        arr.push({
          value: result.rajaongkir.results[i],
          label: result.rajaongkir.results[i].city_name,
        });
      }
      return res.json({ destinations: arr });
    })
    .catch(function (error) {
      return res.json(error);
    });
};

exports.addressList = (req, res) => {
  const { cityId } = req.query;

  var options = {
    method: "GET",
    url: "https://pro.rajaongkir.com/api/subdistrict",
    qs: { city: cityId },
    headers: { key: process.env.RAJA_ONGKIR },
  };

  request(options, async function (error, response, body) {
    if (error) throw new Error(error);

    // return res.json(JSON.parse(body).rajaongkir.results);

    let data = await JSON.parse(body).rajaongkir.results;
    let arr = [];

    for (let i in data) {
      arr.push({
        value: data[i],
        label: data[i].subdistrict_name,
      });
    }
    return res.json({ subdistricts: arr });
  });
};

exports.shippingMethodList = (req, res) => {
  const { destination, weight, subdistrict } = req.query;

  let params = {
    origin: 153,
    destination,
    weight,
    originType: "city",
    destinationType: "subdistrict",
  };

  let arrShipping = [];
  RajaOngkir.getTIKICost(params).then(function (result) {
    let arrTIKI = [];
    // return res.json(result);
    for (let i in result.rajaongkir.results[0].costs) {
      // console.log(result.rajaongkir.results[0].costs[0]);
      arrTIKI.push({
        courier: result.rajaongkir.results[0].code,
        value: result.rajaongkir.results[0].costs[i],
        label: `${result.rajaongkir.results[0].code.toUpperCase()} / ${
          result.rajaongkir.results[0].costs[i].cost[0].etd
        } days / Rp ${result.rajaongkir.results[0].costs[i].cost[0].value}`,
      });
    }
    arrShipping.push({
      label: result.rajaongkir.results[0].name,
      options: arrTIKI,
    });

    RajaOngkir.getPOSCost(params).then(function (result) {
      let arrPOS = [];
      for (let i in result.rajaongkir.results[0].costs) {
        arrPOS.push({
          courier: result.rajaongkir.results[0].code,
          value: result.rajaongkir.results[0].costs[i],
          label: `${result.rajaongkir.results[0].code.toUpperCase()} / ${
            result.rajaongkir.results[0].costs[i].cost[0].etd
          } days / Rp ${MyNumeral(
            result.rajaongkir.results[0].costs[i].cost[0].value
          ).format("0,0.00")}`,
        });
      }
      arrShipping.push({
        label: result.rajaongkir.results[0].name,
        options: arrPOS,
      });

      RajaOngkir.getJNECost(params).then(function (result) {
        let arrJNE = [];
        for (let i in result.rajaongkir.results[0].costs) {
          arrJNE.push({
            courier: result.rajaongkir.results[0].code,
            value: result.rajaongkir.results[0].costs[i],
            label: `${result.rajaongkir.results[0].code.toUpperCase()} / ${
              result.rajaongkir.results[0].costs[i].service
            } / ${
              result.rajaongkir.results[0].costs[i].cost[0].etd
            } days / Rp ${MyNumeral(
              result.rajaongkir.results[0].costs[i].cost[0].value
            ).format("0,0.00")}`,
          });
        }
        arrShipping.push({
          label: result.rajaongkir.results[0].name,
          options: arrJNE,
        });

        return res.json({ shipping: arrShipping });
      });
    });
  });
};

exports.readAllByUser = (req, res) => {
  const { userId } = req.query;

  Order.find({ user: userId, status: { $ne: "fail" } })
    .sort({ field: "asc", createdAt: -1 })
    .populate({
      path: "cart",
      model: "Cart",
      populate: { path: "cart.cart.product", model: "Product" },
    })
    .exec((err, docs) => {
      if (err) return res.json(err);

      if (docs.length < 1) return res.json({ message: "No order data" });

      return res.json({ orders: docs });
    });
};

exports.paymentNotif = (req, res) => {
  const response = req.body;

  Order.findOne({
    "payment.response.transaction_id": response.transaction_id,
  }).exec((err, docs) => {
    if (err) return res.json(err);
    if (docs) {
      if (response.transaction_status == "settlement") {
        docs.payment.response = response;
        docs.status = "packaging";

        docs.save((err, docs) => {
          if (err) return res.json(err);

          res.end();
        });
      }
    }

    res.end();
  });
};
