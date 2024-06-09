// This file contains the routes for handling user authentication

// Importing necessary modules
const express = require("express"); // Express framework
const router = express.Router(); // Creating a new router instance
const User = require("../Models/User"); // Importing the User model

// Importing validation middlewares
const { validationResult, body } = require("express-validator"); // Express validation middleware

// Creating a POST route for user registration
router.post(
  "/registeruser", // Endpoint for registering a new user
  
  // Validating the request body
  body("name", "Name Must be atleast 3 characters long.").isLength({ min: 3 }), // Validating name field
  body("email", "Please Enter a valid email.").isEmail(), // Validating email field
  body("password", "Password Must be atleast 5 characters long.").isLength({ min: 5 }), // Validating password field
  
  // Handling the request
  (req, res) => {
    
    // Validating the request
    const result = validationResult(req); // Validating the request body
    if (!result.isEmpty()) { // If there are any validation errors
      return res.status(400).json({ errors: result.array() }); // Returning the validation errors as a JSON response
    }

    // Creating a new user
    User.create(
      {
        name: req.body.name, // Setting the name from the request body
        email: req.body.email, // Setting the email from the request body
        password: req.body.password, // Setting the password from the request body
      })
      .then(user => res.send(user)) // If the user is created successfully, sending the user object as a response
      .catch(err => {
        if (err.code === 11000) { // If there is a duplicate key error (email already exists)
          res.json({
            message: "A user with this email already exists",
            error: err.errmsg
          }); // Returning a JSON response with the error message
        }
      });
  }
);

// Exporting the router
module.exports = router;