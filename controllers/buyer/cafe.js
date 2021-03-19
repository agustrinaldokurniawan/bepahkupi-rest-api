const csv = require("csv-parser");
const fs = require("fs");
const cafe = require("../../models/cafe");
const results = [];

exports.createFromFile = (req, res) => {
  fs.createReadStream("C:\\Users\\LENOVO\\Downloads\\kafe_csv.csv")
    .pipe(
      csv({
        skipLines: 0,
      })
    )
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      cafe.create(results, (err, docs) => {
        if (err) return res.json(err);
        return res.json({ docs });
      });
    });
};

exports.reads = (req, res) => {
  cafe.find({}).exec((err, docs) => {
    if (err) return res.json(err);
    return res.json({ docs });
  });
};

exports.read = (req, res) => {
  const { id } = req.query;
  cafe.findOne({ _id: id }).exec((err, docs) => {
    if (err) return res.json(err);
    return res.json({ docs });
  });
};
