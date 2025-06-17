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


function authorizeAdmin(req, res, next) {
    if (req.user && req.user.rol === '1') {
        next();
    } else {
        res.redirect('/panel')
    }
}

module.exports = { authenticateToken, authorizeAdmin };