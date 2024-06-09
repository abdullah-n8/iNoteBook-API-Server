const jwt = require("jsonwebtoken");
require('dotenv').config()

const fetchUser = async (req, res, next)=>{

    // Get the User Data from jwt token and add it to req.user
    try {
        
    const token = req.header("auth-token");
    // console.log(token)
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token."});
        console.log();
    }

        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error: "Please authenticate using a valid token.."});
        console.log(error)
    }
}

module.exports = fetchUser;