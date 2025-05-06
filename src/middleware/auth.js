// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/'); 
    }
    
    jwt.verify(token, "test", (err, user) => {
        if (err) return res.redirect('/panel');
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;