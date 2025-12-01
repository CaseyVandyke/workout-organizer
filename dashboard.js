const logout = document.getElementById('logout');
const welcomeMessage = document.getElementById('welcomeMessage');
const exerciseSearch = document.getElementById('exerciseSearch');
const searchResults = document.getElementById('searchResults');

function finalSearch(exercise) {
    searchResults.innerHTML = '';
    return exerciseSearch.value = `${exercise}`;
}

exerciseSearch.addEventListener('input', (e) => {
    const exercise = e.target.value;

    if (exercise.length >= 3) {
        fetch(`http://localhost:8080/api/exercises?name=${exercise}`, {
            method: 'GET'
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text);
                });
            }
            return response.json();
        })
        .then(data => {
            searchResults.innerHTML = '';
            data.exercises.forEach((exercise) => {
                searchResults.innerHTML += `<button onclick="finalSearch('${exercise.name}')">${exercise.name}</button>`;
            })
        })
        .catch(error => {
            console.error('Error', error.message )
        })
    } else {
        searchResults.innerHTML = '';
    }

});

if (logout) {
    handleLogout();
}

if (welcomeMessage) {
    handleWelcomeMessage();
}

function handleLogout() {
    logout.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        window.location.href = '../pages/login.html';
    });
}

function handleWelcomeMessage() {
    const getUsername = localStorage.getItem('username');

    if (getUsername) {
        welcomeMessage.textContent = `Welcome Back ${getUsername}`;
    } else {
        window.location.href = 'login.html';
    }
}