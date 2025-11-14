const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./workout.db');

console.log('===== LOOKING INSIDE workout.db =====\n');

// Show the structure of the users table
db.all("PRAGMA table_info(users)", [], (err, columns) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('USERS TABLE STRUCTURE:');
    console.log('Column Name      | Type    | Can be NULL? | Is Unique?');
    console.log('--------------------------------------------------------');
    columns.forEach(col => {
        console.log(`${col.name.padEnd(16)} | ${col.type.padEnd(7)} | ${col.notnull ? 'No' : 'Yes'}          | ${col.pk ? 'Primary Key' : ''}`);
    });

    console.log('\n');

    // Show all users in the database
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log(`USERS IN DATABASE (${rows.length} total):`);
        if (rows.length === 0) {
            console.log('(empty - no users yet)');
        } else {
            console.log('ID | Username     | Email                | Password Hash (truncated)      | Created At');
            console.log('-------------------------------------------------------------------------------------------');
            rows.forEach(user => {
                console.log(`${user.id}  | ${user.username.padEnd(12)} | ${user.email.padEnd(20)} | ${user.password_hash.substring(0, 20)}... | ${user.created_at}`);
            });
        }

        db.close();
    });
});
