const Order = require("../../models/order");
const User = require("../../models/user");
const Cart = require("../../models/cart");
const Destination = require("../../models/destination");
const Voucher = require("../../models/voucher");
const orderid = require("order-id")("mysecret");
const xendit = require("xendit-node");

const MyNumeral = require("numeral");

const request = require("request");
const cart = require("../../models/cart");

var RajaOngkir = require("rajaongkir-nodejs").Pro(process.env.RAJA_ONGKIR);

const x = new xendit({ secretKey: process.env.XENDIT_PROD });

// const x = new xendit({ secretKey: process.env.XENDIT_TEST });

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

exports.paymentChannels = (req, res, next) => {
  const { VirtualAcc, EWallet } = x;
  const vaSpecificOptions = {};
  const va = new VirtualAcc(vaSpecificOptions);

  let paymentChannels = [];

  va.getVABanks()
    .then((r) => {
      let vaArr = [];
      let eWalletArr = [];
      r.map((item, key) => {
        if (item.code !== "BCA") {
          vaArr.push({
            type: "fva",
            label: item.name,
            value: item,
          });
        }
      });

      paymentChannels.push({ label: "Virtual Bank", options: vaArr });

      // Object.keys(EWallet.Type).map((eWalletItem, eWalletKey) => {
      //   eWalletArr.push({ label: eWalletItem, value: eWalletItem });
      // });

      // paymentChannels.push({
      //   label: "E Wallet",
      //   type: "ewallet",
      //   options: [
      //     {
      //       label: "LinkAja",
      //       value: { name: "Link Aja", code: "LINKAJA" },
      //     },
      //   ],
      // });

      return res.json({ paymentChannels });
    })
    .catch((err) => {
      return res.json(err);
    });
};

exports.payment = (req, res, next) => {
  const { cartId, userId, payment, shipping, promoCode } = req.body;

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

        if (payment.type == "fva") {
          paymentFVA(req.body, docs);
        } else {
          paymentEwallet(req.body, docs);
        }
      });
  });

  res.end();
};

const paymentEwallet = (data, cart) => {
  // const { cartId, userId, payment, shipping, promoCode } = data;

  // let arr = [];
  // cart.cart.cart.map((item, key) => {
  //   arr.push({
  //     id: item.product._id,
  //     name: item.product.name,
  //     price: item.price,
  //     quantity: item.quantity,
  //   });
  // });

  console.log("hi");
  const myPromise = new Promise(async (resolve, reject) => {
    const { EWallet } = x;
    const vaSpecificOptions = {};
    const ew = new EWallet(vaSpecificOptions);
    const resp = await ew.createPayment({
      externalID: "1",
      amount: 1000,
      items: [
        {
          id: "345678",
          name: "Powerbank",
          price: 200000,
          quantity: 1,
        },
      ],
      callbackURL: `${process.env.API_URI}/user/order/paymentNotifPaidEwallet`,
      redirectURL: `${process.env.API_URI}/user/order/paymentNotifPaidEwallet`,
      ewalletType: EWallet.Type.LinkAja,
      // externalID: cartId,
      // amount: cart.cart.totalPrice + shipping.courier.cost,
      // items: [...arr],
      // callbackURL: `${process.env.API_URI}/user/order/paymentNotifPaidEwallet`,
      // redirectURL: `${process.env.API_URI}/user/order/paymentNotifPaidEwallet`,
      // ewalletType: payment.value.code,
    });

    resolve(resp);
    reject("err");
  });

  myPromise
    .then((r) => {
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
          response: r,
        },
        amount: r.amount,
      });

      console.log(r);
      return res.json({ docs });

      // console.log({ newOrder });
      cart.status = "finish";

      cart.save((err, docs) => {
        if (err) return err;
        newOrder.save((err, docs) => {
          if (err) return err;

          return docs;
        });
        return docs;
      });
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const paymentFVA = (data, cart) => {
  const { cartId, userId, payment, shipping, promoCode } = data;

  const myPromise = new Promise(async (resolve, reject) => {
    const { VirtualAcc } = x;
    const vaSpecificOptions = {};
    const va = new VirtualAcc(vaSpecificOptions);
    const resp = await va.createFixedVA({
      externalID: cartId,
      bankCode: payment.value.code,
      name: shipping.name,
      expectedAmt: cart.cart.totalPrice + shipping.courier.cost,
      isClosed: true,
      isSingleUse: true,
    });

    resolve(resp);
    reject("err");
  });

  myPromise
    .then((r) => {
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
          response: r,
        },
        amount: r.expected_amount,
      });

      // console.log({ newOrder });
      cart.status = "finish";

      cart.save((err, docs) => {
        if (err) return err;
        newOrder.save((err, docs) => {
          if (err) return err;

          return docs;
        });
        return docs;
      });
    })
    .catch((err) => {
      throw err;
    });
};

exports.paymentNotifCreatedFVA = (req, res) => {
  const response = req.body;

  return res.json(response);
};

exports.paymentNotifPaidFVA = (req, res) => {
  const response = req.body;

  // return res.json(response);

  Order.findOne({
    "payment.response.external_id": response.external_id,
  }).exec((err, docs) => {
    if (err) return res.json(err);
    if (docs) {
      docs.payment.response = response;
      docs.status = "packaging";

      docs.save((err, docs) => {
        if (err) return res.json(err);

        return res.json(response);
      });
    }
  });
};

exports.paymentEwallet = (req, res) => {
  const { cartId } = req.body;

  const { EWallet } = x;
  const vaSpecificOptions = {};
  const ew = new EWallet(vaSpecificOptions);

  ew.createPayment({
    externalID: cartId,
    amount: 10000,
    phone: "08123123123",
    ewalletType: "OVO",
  })
    .then((r) => {
      return res.json(r);
    })
    .catch((err) => {
      return res.json(err);
    });
};

exports.paymentNotifCreatedEwallet = (req, res) => {
  const response = req.body;

  console.log(response);

  // if(response.status == 'PRNDING'){
  //   console.log('Payment Pending')
  // }

  return res.json(response);
};

exports.paymentNotifPaidEwallet = (req, res) => {
  const response = req.body;

  console.log({ response });

  return res.json(response);
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
