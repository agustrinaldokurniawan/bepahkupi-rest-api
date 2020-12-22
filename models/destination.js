const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const destinationSchema = new Schema(
  {
    rajaongkir: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", destinationSchema);
