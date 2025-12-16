const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database');
const jwt = require('jsonwebtoken');
const JWT_SECRET = '106cd143ad9978eb1516a2920703319cc70a5769e32985139d09a7d9c44fb501';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get token after "Bearer "

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Token is valid - attach user info to request
        req.user = decoded; // decoded contains { id, username }
        next(); // Continue to the actual endpoint
    });
}

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

                const newUserId = this.lastID;
                 // Generate JWT token for the new user
                const token = jwt.sign(
                    { id: newUserId, username: username },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                res.status(201).json({
                    success: true,
                    message: 'User created successfully',
                    username,
                    token
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
                const token = jwt.sign(
                    {id: user.id, username: user.username },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                return res.status(200).json({
                    success: true,
                    username,
                    token
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

app.post('/api/add-workout', verifyToken, (req, res) => {
    const { exerciseName, sets, reps, weight } = req.body;
    const todaysDate = new Date().toISOString().split('T')[0]; 

    // First, find the exercise ID from the exercise name
    db.get('SELECT * FROM exercises WHERE name = ?', [exerciseName], (err, exercise) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error'
            })
        }
        if (exercise.id) {
            console.log('Exercise found:', exercise);
            console.log('User ID:', req.user.id);
            console.log('Todays date:', todaysDate);
            db.get('SELECT * FROM sessions WHERE user_id = ? AND date = ?', [req.user.id, todaysDate], (err, session) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'Database error'
                    })
                }
                console.log('Session query result:', session);
                if (session) {
                    console.log('Session found:', session);
                    db.run('INSERT INTO session_exercises (session_id, exercise_id, sets, reps, weight) VALUES (?, ?, ?, ?, ?)', [session.id, exercise.id, sets, reps, weight],
                        function(err) {
                            if (err) {
                                console.log('INSERT ERROR (existing session):', err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Failed to add exercise'
                                });
                            }
                            res.status(200).json({
                                success: true,
                                message: 'Exercise Added!'
                            });
                        }
                    )
                } else {
                    // Session doesn't exist - create new one
                    console.log('No session found, creating new one');
                    db.run('INSERT INTO sessions (user_id, name, date) VALUES (?, ?, ?)', [req.user.id, 'Workout', todaysDate],
                        function(err) {
                            if (err) {
                                console.log('CREATE SESSION ERROR:', err);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Failed to create session'
                                });
                            }
                            console.log('Session created successfully, ID:', this.lastID);
                            const newSessionId = this.lastID;
                            db.run('INSERT INTO session_exercises (session_id, exercise_id, sets, reps, weight) VALUES (?, ?, ?, ?, ?)', [newSessionId, exercise.id, sets, reps, weight],
                                function(err) {
                                    if (err) {
                                        console.log('INSERT ERROR (new session):', err);
                                        return res.status(500).json({
                                            success: false,
                                            message: 'Failed to add exercise'
                                        });
                                    }
                                    res.status(200).json({
                                        success: true,
                                        message: 'Exercise Added!'
                                    });
                                }
                            )
                        }
                    )
                }
            })
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server starting on http://localhost:${PORT}`);
});