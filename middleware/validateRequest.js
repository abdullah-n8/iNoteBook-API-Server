const { body, validationResult } = require("express-validator"); // Library for validating request bodies

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = validateRequest;