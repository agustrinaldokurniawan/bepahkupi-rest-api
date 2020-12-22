const User = require("../../models/user");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const AWS = require("aws-sdk");
const randomString = require("randomstring");

exports.createAccount = (req, res) => {
  const { email, password, name } = req.body;

  User.findOne({ email }, (err, docs) => {
    if (err) return res.json(err);

    if (docs) return res.json({ message: "Email already been used" });

    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) return res.json(err);
      const newAccount = new User({
        email,
        password: hash,
        name,
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

  User.findOne({ _id: id }, (err, docs) => {
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
  const { email, password } = req.body;

  User.findOne({ email }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Account not found" });

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
};

exports.readAccounts = (req, res) => {
  User.find({}, (err, docs) => {
    if (err) return res.json(err);

    return res.json({ accounts: docs });
  });
};

exports.updateAccount = (req, res) => {
  const { newName, newEmail, newPassword, email, password } = req.body;

  User.findOne({ email }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Account not found" });

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

      if (newEmail && newEmail !== docs.email) {
        docs.email = newEmail;
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
};

exports.deleteAccount = (req, res) => {
  const { id } = req.body;

  User.findOne({ _id: id }, (err, docs) => {
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

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  AWS.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: "us-west-2",
  });

  var ses = new AWS.SES({ apiVersion: "2010-12-01" });

  const code = randomString.generate(5);

  User.findOne({ email }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Account not found" });

    if (docs) {
      if (docs.status == "inactive")
        return res.json({
          message:
            "Your account is inactive, please contact admin to activate it again",
        });
    }

    var params = {
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: `Your verification code: ${code}`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "Change Password",
        },
      },
      ReplyToAddresses: [],
      Source: "Bepahkupi <hello@bepahkupi.com>",
    };
    ses.sendEmail(params, function (err, data) {
      // return res.json(err, err.stack);
      if (err)
        return res.json({
          message: "Error while check email, please try again later",
        });

      docs.issue = code;

      docs.save((err, docs) => {
        if (err) return res.json(err);

        return res.json({ account: docs });
      });
    });
  });
};

exports.changePassword = (req, res) => {
  const { email, code, password } = req.body;

  User.findOne({ email }, (err, docs) => {
    if (err) return res.json(err);

    if (!docs) return res.json({ message: "Account not found" });

    if (docs.issue !== code)
      return res.json({ message: "Verification code wrong" });

    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) return res.json(err);

      docs.password = hash;
      docs.issue = "";

      docs.save((err, docs) => {
        if (err) return res.json(err);

        return res.json({ account: docs });
      });
    });
  });
};
