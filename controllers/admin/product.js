const upload = require("../services/files");
const Product = require("../../models/product");
const product = require("../../models/product");

const slugify = require("slugify");

const singleUpload = upload.single("image");

exports.createProduct = (req, res) => {
  singleUpload(req, res, function (err) {
    const { name, type, groundLevel, price, description } = req.body;

    if (err) {
      return res.status(422).send({
        errors: [{ title: "Image Upload Error", detail: err.message }],
      });
    }

    Product.findOne({ name }, (err, docs) => {
      if (err) return res.json(err);

      if (docs) return res.json({ message: "Duplicate name" });

      const newProduct = new Product({
        name,
        slug: slugify(name),
        type,
        groundLevel,
        price,
        description,
        image: req.file.location,
      });

      newProduct.save((err, docs) => {
        if (err) return res.json(err);

        return res.json({ product: docs });
      });
    });
  });
};

exports.readProduct = (req, res) => {
  const { slug } = req.query;

  Product.findOne({ slug }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Product not found" });

    return res.json({ product: docs });
  });
};

exports.readProducts = (req, res) => {
  Product.find({}, (err, docs) => {
    if (err) return res.json(err);

    return res.json({ products: docs });
  });
};
exports.updateProduct = (req, res) => {
  const { productId, name, type, groundLevel, price, description } = req.body;

  Product.findOne({ _id: productId }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Product not found" });

    docs.name = name;
    docs.type = type;
    docs.groundLevel = groundLevel;
    docs.price = price;
    docs.description = description;

    return res.json({ product: docs });

    // newProduct.save((err, docs) => {
    //   if (err) return res.json(err);

    //   return res.json({ product: docs });
    // });
  });
};
exports.deleteProduct = (req, res) => {
  const { id } = req.body;

  Product.findById(id, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Product not found" });

    (docs.status = "inactive"),
      docs.save((err, docs) => {
        if (err) return res.json(err);

        return res.json({ product: docs });
      });
  });
};
