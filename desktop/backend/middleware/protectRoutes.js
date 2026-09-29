// backend/middleware/protectRoute.js
const jwt = require('jsonwebtoken');

const protectRoute = (req, res, next) => {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        // Verify the token and decode it
        const decoded = jwt.verify(token, 'your-secret-key'); // Use the same secret key as during token generation
        req.user = decoded;  // Attach user info (userId) to the request object
        next();  // Continue to the next route handler
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = protectRoute;
