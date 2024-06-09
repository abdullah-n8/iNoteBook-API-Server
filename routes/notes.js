const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator"); // Library for validating request bodies

const Note = require('../models/Note');// Import the User model from the models directory

// Importing Custom MiddleWare
const fetchUser = require('../middleware/fetchUser')
const validateRequest = require('../middleware/validateRequest')


// ROUTE 1 : Get all the notes of the user by using: GET  "5000/api/notes/getall"
router.get('/getall', fetchUser, async (req, res)=>{
    try {
        const notes = await Note.find({userID: req.user.id})
        res.send(notes)
    } catch (error) {
        res.status(500).json({ message: "Something went wrong.", error: error.message});
    }
   
});


// ROUTE 2 : Add a new note of the user by using: POST  "5000/api/notes/addnote"


router.post('/addnote', fetchUser, [
    body("title", "Title must be at least 3 characters long").isLength({
        min: 3,
    }),
    body("description", "Description must be at least 5 characters long").isLength({
        min: 5,
    }),
    validateRequest
], async (req, res)=>{
    try {
        const { title, description, tag } = req.body;
        const note = new Note({
            title, description, tag, userID: req.user.id
        })
        const savedNote = await note.save();
        res.send(savedNote);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong.", error: error.message});
    }
})


module.exports = router;