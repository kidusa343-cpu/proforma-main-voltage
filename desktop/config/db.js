const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');

let dbPath;
if (app.isPackaged) {
  // Packaged app
  dbPath = path.join(process.resourcesPath, 'resources', 'newDatabase.db');
} else if (process.env.PRODUCTION === 'true') {
  // Simulated production (development with PRODUCTION=true)
  dbPath = path.join(__dirname, '..', 'resources', 'newDatabase.db');
} else {
  // Development
  dbPath = path.join(__dirname, '../newDatabase.db');
}
console.log('Using database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the database at:', dbPath);
    // Initialize backup_timestamps table immediately after connection
    db.run(`
      CREATE TABLE IF NOT EXISTS backup_timestamps (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        lastBackupTime TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Failed to create backup_timestamps table:', err);
        throw err;
      } else {
        db.run(`
          INSERT OR IGNORE INTO backup_timestamps (id, lastBackupTime) VALUES (1, '1970-01-01 00:00:00')
        `, (err) => {
          if (err) {
            console.error('Failed to initialize backup_timestamps:', err);
            throw err;
          } else {
            console.log('backup_timestamps table initialized');
          }
        });
      }
    });
  }
});

module.exports = db;






















