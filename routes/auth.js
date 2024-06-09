const express = require("express");
const router = express.Router();
const User = require("../Models/User");

const {
  query,
  matchedData,
  validationResult,
  body,
} = require("express-validator");

router.post(
  "/register",
  body("name", "Name Must be atleast 3 characters long.").isLength({ min: 3 }),
  body("email", "Please Enter a valid email.").isEmail(),
  body("password", "Password Must be atleast 5 characters long.").isLength({
    min: 5,
  }),
  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    } else {
      User.create(
        {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        })
        .then(user => res.send(user))
        .catch(err => {
            res.json({
                message: "This email is already registered..",
                error: err.errmsg
            });
        });
    }
  }
);

module.exports = router;
