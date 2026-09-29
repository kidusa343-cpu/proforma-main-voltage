const path = require('path');
const db = require(path.join(__dirname, '../../config/db'));
db.run(`
  CREATE TABLE IF NOT EXISTS proformas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proformaNumber TEXT UNIQUE,
    customerName TEXT,
    plateNumber TEXT,
    vin TEXT,
    model TEXT,
    referenceNumber TEXT UNIQUE,
    deliveryTime TEXT,
    preparedBy TEXT,
    validityInDays INTEGER,
    dateCreated TEXT,
    subTotal REAL,
    vat REAL,
    totalAmount REAL,
  lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
// db.run(`
//   CREATE TABLE IF NOT EXISTS backup_timestamps (
//     id INTEGER PRIMARY KEY CHECK (id = 1),
//     lastBackupTime TIMESTAMP
//   )
// `);

// // Insert a default row if it doesn't exist
// db.run(`
//   INSERT OR IGNORE INTO backup_timestamps (id, lastBackupTime) VALUES (1, '1970-01-01 00:00:00')
// `);

module.exports = db;