const AdminAccount = require("../../models/adminAccount");

const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.createAccount = (req, res) => {
  const { username, password, name } = req.body;

  AdminAccount.findOne({ username }, (err, docs) => {
    if (err) return res.json(err);

    if (docs) return res.json({ message: "Username already been used" });

    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) return res.json(err);
      const newAccount = new AdminAccount({
        username,
        password: hash,
        name,
        status: "active",
      });

      newAccount.save((err, docs) => {
        if (err) return res.json(err);

        return res.json({ account: docs });
      });
    });
  });
};

exports.readAccount = (req, res) => {
  const { id } = req.query;

  AdminAccount.findOne({ _id: id }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Account not found" });

    if (docs) {
      if (docs.status == "inactive")
        return res.json({
          message:
            "Your account is inactive, please contact admin to activate it again",
        });
    }

    return res.json({ account: docs });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;

  AdminAccount.findOne({ username }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Account not found" });

    AdminAccount.findOne({ username }, (err, docs) => {
      if (err) return res.json(err);

      if (docs) {
        if (docs.status == "inactive")
          return res.json({
            message:
              "Your account is inactive, please contact admin to activate it again",
          });
      }

      bcrypt.compare(password, docs.password, function (err, result) {
        if (err) return res.json(err);
        console.log({ password, pass: docs.password, result });
        if (!result)
          return res.json({
            message: "Wrong password",
          });

        return res.json({ account: docs });
      });
    });
  });
};

exports.readAccounts = (req, res) => {
  AdminAccount.find({}, (err, docs) => {
    if (err) return res.json(err);

    return res.json({ accounts: docs });
  });
};

exports.updateAccount = (req, res) => {
  const { newName, newUsername, newPassword, username, password } = req.body;

  AdminAccount.findOne({ username }, (err, docs) => {
    if (!docs) return res.json({ message: "Account not found" });

    AdminAccount.findOne({ username }, (err, docs) => {
      if (err) return res.json(err);

      if (docs) {
        if (docs.status == "inactive")
          return res.json({
            message:
              "Your account is inactive, please contact admin to activate it again",
          });
      }

      bcrypt.compare(password, docs.password, function (err, result) {
        if (err) return res.json(err);

        if (!result)
          return res.json({
            message: "Wrong password",
          });

        if (newUsername && newUsername !== docs.username) {
          docs.username = newUsername;
        }

        if (newName && newName !== docs.name) {
          docs.name = newName;
        }

        if (newPassword) {
          bcrypt.compare(password, docs.password, function (err, result) {
            if (err) return res.json(err);

            if (result) {
              bcrypt.hash(newPassword, saltRounds, function (err, hash) {
                if (err) return res.json(err);

                console.log({ p1: docs.password, hash });
                docs.password = hash;

                docs.save((err, docs) => {
                  if (err) return res.json(err);

                  return res.json({ account: docs });
                });
              });
            }
          });
        } else {
          return res.json({ account: docs });
        }
      });
    });
  });
};

exports.deleteAccount = (req, res) => {
  const { id } = req.body;

  AdminAccount.findOne({ _id: id }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Account not found" });

    if (docs) {
      if (docs.status == "inactive")
        return res.json({
          message:
            "Your account is inactive, please contact admin to activate it again",
        });
    }

    docs.status = "inactive";

    docs.save((err, docs) => {
      if (err) return res.json(err);

      return res.json({ account: docs });
    });
  });
};
