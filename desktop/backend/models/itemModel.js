const path = require('path');
const db = require(path.join(__dirname, '../../config/db'));
db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proformaId INTEGER,
    itemName TEXT,
    unit TEXT,
    quantity INTEGER,
    unitPrice REAL,
    totalPrice REAL,
    remarks TEXT,
    lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(proformaId) REFERENCES proformas(id) ON DELETE CASCADE
  )
`);
module.exports = db;
