const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (signupForm) {
    signupForm.addEventListener('submit', handleSignUp);
}

function handleSignUp(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    fetch('http://localhost:8080/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            email,
            password
        })
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Account created successfully!');
            localStorage.setItem('authToken', data.token);
            window.location.href = '../index.html';
        } else {
            alert(data.message || 'Signup failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Could not connect to server');
    });
}

function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please fill in all fields');
        return;
    }

    fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    })
        .then(response => {
            console.log('RESPONSE object:', response);  // Log the response object
            console.log('response.status:', response.status);  // Log status code
            console.log('response.ok:', response.ok);  // Log if successful
            console.log('Calling response.json()...');

            return response.json();  // Parse the body
        })
        .then(data => {
            console.log('DATA (parsed JSON):', data);  // Log the parsed data
            console.log('data.success:', data.success);
            console.log('data.token:', data.token);

            if (data.success) {
                alert('Welcome back!');
                localStorage.setItem('authToken', data.token);
                window.location.href = '../index.html';
            } else {
                alert(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Could not connect to server');
        });
}