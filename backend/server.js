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
            console.log('Database error:', err)
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
                return res.json(500).json({
                    success: false,
                    message: 'Server error'
                });
            }
        })
    });
})