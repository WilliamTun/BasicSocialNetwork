const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    // Get token from header 
    const token = req.header('x-auth-token');

    // Check if no token available and route is protected by this middleware, return msg
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token if a token is available
    try {
        // decode token via jwt.verify 
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        // set req.user to user in decoded token.
        // can now use that user in each route protected by auth.  
        req.user = decoded.user; 
        next();
    } catch(err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
}