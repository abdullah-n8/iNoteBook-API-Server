const express = require("express");
const app = express();

const connectToMongo = require("./db")

connectToMongo();

require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));


app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})