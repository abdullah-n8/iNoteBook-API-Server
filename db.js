const mongoose = require('mongoose');
require("dotenv").config();

const mongo_uri = process.env.MONGO_URI;

async function connectToMongo() {
    try {
        await mongoose.connect(mongo_uri)
        console.log("Database successfully connected!")
    } catch (err) {
       console.log(err);
    }
}


module.exports = connectToMongo;