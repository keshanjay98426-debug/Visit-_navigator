const jwt = require('jsonwebtoken');

// Middleware function to protect routes using JWT authentication
module.exports = function (req, res, next) {
   
    const token = req.header('Authorization');
    // Get the token from the Authorization header
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    //verify the token using the secret key
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    //if token is invalid, return an error response
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};