// backend/models/userModel.js (Example)
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = require(path.join(__dirname, '../../config/db'));
const bcrypt = require('bcrypt');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usernameOrEmail TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);

const createUser = async (usernameOrEmail, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (usernameOrEmail, password) VALUES (?, ?)`,
      [usernameOrEmail, hashedPassword],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, usernameOrEmail });
      }
    );
  });
};

const findUser = async (usernameOrEmail) => {
  return new Promise((resolve, reject) => {
    console.log('userModel: Querying user with usernameOrEmail:', usernameOrEmail);
    db.get(
      `SELECT * FROM users WHERE usernameOrEmail = ?`,
      [usernameOrEmail],
      (err, row) => {
        if (err) {
          console.error('userModel: Error querying user:', err);
          reject(err);
        } else {
          console.log('userModel: Found user:', row);
          resolve(row);
        }
      }
    );
  });
};

module.exports = { createUser, findUser };
