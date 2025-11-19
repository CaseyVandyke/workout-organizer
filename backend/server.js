const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database');

// creates web server
const app = express();
const PORT = 8080;

// How many times bcrypt will hash the password(more = more secure but slower)
const SALT_ROUNDS = 10;

// Allows your frontend (on a different port/file) to talk to this server
app.use(cors());
// Allows the server to read JSON data from requests
app.use(express.json());

app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    console.log('=== Signup Attempt ===');
    console.log('Username:', username);
    console.log('Email:', email);

    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, existingUser) => {
        if (err) {
            console.log('Database error:', err);
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

        bcrypt.hash(password, SALT_ROUNDS, (err, password_hash) => {
            if (err) {
                console.error('Bcrypt error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Server error'
                });
            }
            db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, password_hash], (err) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create user'
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'User created successfully',
                    username
                });
            });
        });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password ) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
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
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Server error' 
                });
            }

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            if (isMatch) {
                return res.status(200).json({
                    success: true,
                    username,
                    token: 'demo-token-login-123'
                });
            }
        });
    });
});

app.get('/api/exercises', (req, res) => {
    const searchTerm = req.query.name;
    if (!searchTerm || searchTerm.length < 3) {
        return res.status(400).json({
            success: false,
            message: 'Search term must be at least 3 characters'
        });
    }
    console.log('name is long enough');

    db.all('SELECT * FROM exercises WHERE name LIKE ?', [`%${searchTerm}%`], (err, exercises) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }
        console.log('Found exercises:', exercises);
        res.json({ success: true, exercises });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server starting on http://localhost:${PORT}`);
});