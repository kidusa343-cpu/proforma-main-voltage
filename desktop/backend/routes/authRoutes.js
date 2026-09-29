// // backend/routes/authRoutes.js
// const express = require('express');
// const bcrypt = require('bcrypt');
// const { createUser, findUser } = require('../models/userModel');
// const router = express.Router();

// router.post('/signup', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const newUser = await createUser(username, password);
//         res.json({ success: true, user: newUser });
//     } catch (error) {
//         console.error('Error signing up:', error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// });

// router.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const user = await findUser(username);

//         if (!user) {
//             return res.status(401).json({ success: false, message: 'Invalid credentials' });
//         }

//         const passwordMatch = await bcrypt.compare(password, user.password);

//         if (!passwordMatch) {
//             return res.status(401).json({ success: false, message: 'Invalid credentials' });
//         }

//         res.json({ success: true, user: { id: user.id, username: user.username } });
//     } catch (error) {
//         console.error('Error logging in:', error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// });

// module.exports = router;

// backend/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { createUser, findUser } = require('../models/userModel');
const router = express.Router();

// Use cookie parser middleware
router.use(cookieParser());

// JWT secret key (should be in .env for production)
const JWT_SECRET = 'your-secret-key'; // Change this to a more secure value

// Signup Route (Already done in your code)
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = await createUser(username, password);
        res.json({ success: true, user: newUser });
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login Route (Generate JWT token and set it in a cookie)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request:', { username, password }); // Log incoming request data

    try {
        const user = await findUser(username);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', passwordMatch); // Log result of password comparison

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '1h',
        });

        // Set token as a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // Token expires in 1 hour
        });
        

        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});



// Logout Route (Clear the JWT token cookie)
router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clears the cookie
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
