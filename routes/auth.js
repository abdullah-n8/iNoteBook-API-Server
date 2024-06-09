const express = require("express"); // Express framework for building APIs
const bcrypt = require("bcrypt"); // Library for hashing passwords
const jwt = require("jsonwebtoken"); // Library for generating JSON Web Tokens
const { body, validationResult } = require("express-validator"); // Library for validating request bodies
const User = require("../models/User"); // Import the User model from the models directory

const router = express.Router(); // Create a new router instance

const saltRounds = 12; // Number of salt rounds to use when hashing passwords
const jwtSecret = process.env.JWT_SECRET; // JWT secret key for signing tokens

// Middleware to validate request body
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Route handler for user registration.
 *
 * @route POST /auth/register
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} - JSON Web Token
 */
router.post(
  "/register",
  [
    body("name", "Name must be at least 3 characters long").isLength({
      min: 3,
    }),
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
    }),
    validateRequest,
  ],
  async (req, res) => {
    const { name, email, password } = req.body; // Destructure request body
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash the user's password

    const user = await User.create({ name, email, password: hashedPassword }); // Create a new user in the database
    const authToken = jwt.sign({ id: user._id }, jwtSecret); // Generate a JSON Web Token
    res.status(201).send(authToken); // Return the token in the response
  }
);

/**
 * Route handler for user login.
 *
 * @route POST /auth/login
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Object} - JSON Web Token
 */
router.post(
  "/login",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Please enter a password").exists(),
    validateRequest,
  ],
  async (req, res) => {
    const { email, password } = req.body; // Destructure request body

    const user = await User.findOne({ email })  // Find a user with the given email
   
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" }); // Return error response if no user with the given email is found
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); // Compare the given password with the hashed password in the database
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" }); // Return error response if the password is invalid
    }

    const authToken = jwt.sign({ id: user._id }, jwtSecret); // Generate a JSON Web Token
    res.send(authToken); // Return the token in the response
  }
);

module.exports = router; // Export the router instance
