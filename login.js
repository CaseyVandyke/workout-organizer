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
            console.log('RESPONSE object:', response);
            console.log('response.status:', response.status);
            console.log('response.ok:', response.ok);
            console.log('Calling response.json()...');

            return response.json();
        })
        .then(data => {
            console.log('DATA (parsed JSON):', data);
            console.log('data.success:', data.success);
            console.log('data.token:', data.token);

            if (data.success) {
                alert('Welcome back!');
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('username', data.username);
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Could not connect to server');
        });
}
