const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'workout.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

const createWorkoutsTable = `
    CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
`;

const createWorkoutExercisesTable = `
      CREATE TABLE IF NOT EXISTS workout_exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_id INTEGER NOT NULL,
          exercise_id INTEGER NOT NULL,
          sets INTEGER NOT NULL,
          reps INTEGER NOT NULL,
          weight REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
          FOREIGN KEY (exercise_id) REFERENCES exercise (id)
      )
  `;

const createExerciseTable = `
    CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )
`;

function initializeDatabase() {
    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON');

        db.run(createUsersTable, (err) => {
            if (err) {
                console.error('Error creating users table', err);
            } else {
                console.log('Users table ready');
            }
        });

        db.run(createWorkoutsTable, (err) => {
            if (err) {
                console.error('Error creating workout table', err);
            } else {
                console.log('Workout table ready');
            }
        });

        db.run(createWorkoutExercisesTable, (err) => {
            if (err) {
                console.error('Error creating workout exercises table', err);
            } else {
                console.log('Workout exercise table ready');
            }
        })

        db.run(createExerciseTable, (err) => {
            if (err) {
                console.error('Error creating exercise', err);
            } else {
                console.log('Exercise table ready');
            }
        });
    });
}

module.exports = db;