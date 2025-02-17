const { json } = require("express");
const { JWT_SECRET } = require("./config");
const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(403).json({
            msg: "Authorization fails!! Please try again later."
        })
    }
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if(decoded.userId){
            req.userId = decoded.userId;
            next();
        }
    } catch (error) {
        return res.status(403).json({
            msg: "Something went wrong!! Please try again later."
        })
    }
}

module.exports = {
    authMiddleware
}