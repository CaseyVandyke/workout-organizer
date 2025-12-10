const logout = document.getElementById('logout');
const welcomeMessage = document.getElementById('welcomeMessage');
const exerciseSearch = document.getElementById('exerciseSearch');
const searchResults = document.getElementById('searchResults');
const exerciseRecord = document.getElementById('exerciseRecord');
const selectedExerciseName = document.getElementById('selectedExerciseName');
const addWorkout = document.getElementById('addWorkout');

if (exerciseRecord) {
    exerciseRecord.addEventListener('submit', handleAddWorkout);
}

function handleAddWorkout(e) {
    e.preventDefault();
    const sets = document.querySelector('#exerciseSets').value;
    const reps = document.querySelector('#exerciseReps').value;
    const weight = document.querySelector('#exerciseWeight').value;
    const exerciseName = selectedExerciseName.textContent;

    fetch('http://localhost:8080/api/add-workout', {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
        },
        body: JSON.stringify({
            exerciseName,
            sets,
            reps,
            weight
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Workout added successfully!');
            // Clear form and hide it
            exerciseRecord.style.display = 'none';
            document.querySelector('#exerciseSets').value = '';
            document.querySelector('#exerciseReps').value = '';
            document.querySelector('#exerciseWeight').value = '';
        } else {
            alert(data.message || 'Failed to add workout');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add workout');
    }); 
}

function finalSearch(exercise) {
    searchResults.innerHTML = '';
    exerciseRecord.style.display = 'block';
    selectedExerciseName.innerHTML = `${exercise}`;
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