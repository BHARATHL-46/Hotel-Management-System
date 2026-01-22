const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Protect Middleware: Token received');

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Protect Middleware: Decoded payload:', decoded);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.log('Protect Middleware: User not found for ID:', decoded.id);
                return res.status(401).json({ message: 'User not found' });
            }

            console.log('Protect Middleware: User authenticated:', req.user.email, 'Role:', req.user.role);
            return next();
        } catch (error) {
            console.error('Protect Middleware: JWT Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        console.log('Protect Middleware: No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
