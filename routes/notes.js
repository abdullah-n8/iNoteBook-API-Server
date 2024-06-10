const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator"); // Library for validating request bodies

const Note = require("../models/Note"); // Import the User model from the models directory

// Importing Custom MiddleWare
const fetchUser = require("../middleware/fetchUser");
const validateRequest = require("../middleware/validateRequest");

// ROUTE 1 : Get all the notes of the user by using: GET  "/api/notes/getall"
router.get("/getall", fetchUser, async (req, res) => {
  try {
    const notes = await Note.find({ userID: req.user.id });
    res.send(notes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
});

// ROUTE 2 : Add a new note of the user by using: POST  "/api/notes/addnote"

router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Title must be at least 3 characters long").isLength({
      min: 3,
    }),
    body(
      "description",
      "Description must be at least 5 characters long"
    ).isLength({
      min: 5,
    }),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const note = new Note({
        title,
        description,
        tag,
        userID: req.user.id,
      });
      const savedNote = await note.save();
      res.send(savedNote);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Something went wrong.", error: error.message });
    }
  }
);

// Route 3: Update an existing note by using: PUT "/api/notes/updatenote"

router.put("/updatenote/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found with this id." });
    }

    if (note.userID.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized." });
    } 

      note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.send(note);
    

  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
});



// Route 4: Delete an existing note by using: DE:ETE "/api/notes/deletenote"

router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found with this id." });
    }

    if (note.userID.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized." });
    } 

      note = await Note.findByIdAndDelete(req.params.id);
      res.json({
        Success: true,
        message: "Note deleted successfully.",
        note: note
      });
    

  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
});

module.exports = router;
