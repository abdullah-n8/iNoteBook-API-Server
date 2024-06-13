const express = require("express"); // Express framework for building APIs
const bcrypt = require("bcrypt"); // Library for hashing passwords
const jwt = require("jsonwebtoken"); // Library for generating JSON Web Tokens
const { body, validationResult } = require("express-validator"); // Library for validating request bodies
const User = require("../models/User");// Import the User model from the models directory

// Importing Custom MiddleWare
const fetchUser = require('../middleware/fetchUser')
const validateRequest = require('../middleware/validateRequest')

const router = express.Router(); // Create a new router instance

const saltRounds = 12; // Number of salt rounds to use when hashing passwords
const jwtSecret = process.env.JWT_SECRET; // JWT secret key for signing tokens

// Middleware to validate request body



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

    let success = false;
    
    const { name, email, password } = req.body; // Destructure request body
    try {
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash the user's password

    const user = await User.create({ name, email, password: hashedPassword }); // Create a new user in the database

    const data = {
        user: {
          id: user.id
        }
      }

    const authToken = jwt.sign(data, jwtSecret); // Generate a JSON Web Token

    success = true;
    res.status(201).send({success, authToken}); // Return the token in the response
    } catch (error) {
        if (error.code === 11000) {
          return res.status(400).json({
            success,
            message: "User already exists",
          });
        }
      res.status(500).json({
        success,
        message: "Something went wrong.", error: error.message}
    );
    }
  }
);


router.post(
  "/login",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Please enter a password").exists(),
    validateRequest,
  ],
  async (req, res) => {

    let success = false

    try {

    const { email, password } = req.body; // Destructure request body

    const user = await User.findOne({email: email})  // Find a user with the given email
    if (!user) {
      success = false
      return res.status(400).json({ success: success, error: "Invalid email or password" }); // Return error response if no user with the given email is found
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); // Compare the given password with the hashed password in the database
    if (!isPasswordValid) {
      return res.status(400).json({ success: success, error: "Invalid email or password" }); // Return error response if the password is invalid
    }

    const data = {
        user: {
          id: user.id
        }
      }

  
    const authToken = jwt.sign(data, jwtSecret); // Generate a JSON Web Token
    success = true;

    res.send({success, authToken}); // Return the token in the response
    } catch (error) {
      res.status(500).json({ message: "Something went wrong.", error: error.message});
    }   
  }
);

router.get('/getuser', fetchUser, async (req, res)=>{
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Something went wrong.", error: error.message});
    }
})

module.exports = router; // Export the router instance
