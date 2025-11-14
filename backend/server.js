const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

const SALT_ROUNDS = 10;

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    console.log('=== Login Attempt ===');
    console.log('Username:', username);

    // Find user in database
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Compare password with hashed password
        bcrypt.compare(password, user.password_hash, (err, match) => {
            if (err) {
                console.error('Bcrypt error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }

            if (match) {
                console.log('Login successful');
                res.status(200).json({
                    success: true,
                    token: `token-${user.id}-${Date.now()}`,
                    username: user.username
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }
        });
    });
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    console.log('=== Signup Attempt ===');
    console.log('Username:', username);
    console.log('Email:', email);

    // Check if user already exists
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, existingUser) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Hash password
        bcrypt.hash(password, SALT_ROUNDS, (err, password_hash) => {
            if (err) {
                console.error('Bcrypt error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }

            // Insert new user into database
            db.run(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                [username, email, password_hash],
                function(err) {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Failed to create account'
                        });
                    }

                    console.log('User created successfully with ID:', this.lastID);
                    res.status(201).json({
                        success: true,
                        token: `token-${this.lastID}-${Date.now()}`,
                        username: username
                    });
                }
            );
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server starting on http://localhost:${PORT}`);
});
