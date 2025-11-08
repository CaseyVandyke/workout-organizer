const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Log what we received
    console.log('=== Login Attempt ===');
    console.log('Username:', username);
    console.log('Password:', password);
    console.log('====================');

    // Send success response (for now, always succeeds)
    res.status(200).json({
        success: true,
        token: 'demo-token-123',
        username: username
    });
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    // Log what we received
    console.log('=== Signup Attempt ===');
    console.log('Username:', username);
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('====================');

    // Send success response (for now, always succeeds)
    res.status(200).json({
        success: true,
        token: 'demo-token-456',
        username: username
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server starting on http://localhost:${PORT}`);
});
