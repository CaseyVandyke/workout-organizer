const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
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