const axios = require('axios');
const db = require('./config/db'); // Use the existing db object from db.js
const dns = require('dns').promises;

async function backupToRemoteServer() {
  try {
    // Check for internet connectivity
    async function checkInternetConnection() {
      try {
        await dns.lookup('google.com');
        return true;
      } catch (error) {
        return false;
      }
    }
    console.log('Starting backup process...');
    const online = await checkInternetConnection();
    if (!online) {
      console.log('No internet connection. Skipping backup.');
      return;
    }

    // Get the last backup timestamp (using the shared db object)
    const lastBackupTime = await new Promise((resolve, reject) => {
      db.get('SELECT lastBackupTime FROM backup_timestamps WHERE id = 1', [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.lastBackupTime : '1970-01-01 00:00:00');
      });
    });

    console.log('Last backup time:', lastBackupTime);

    // Fetch only proformas modified since the last backup
    const proformas = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM proformas WHERE lastModified > ?', [lastBackupTime], (err, rows) => {
        if (err) {
          console.error('Error fetching proformas:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    // Fetch only items modified since the last backup
    const items = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM items WHERE lastModified > ?', [lastBackupTime], (err, rows) => {
        if (err) {
          console.error('Error fetching items:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    console.log('Fetched proformas:', proformas);
    console.log('Fetched items:', items);

    // If no new or edited records, skip the backup
    if (proformas.length === 0 && items.length === 0) {
      console.log('No new or edited records to backup. Skipping backup.');
      return;
    }

    // Prepare the backup data
    const backupData = { proformas, items };

    // Send the backup to the remote server
    const response = await axios.post('https://proforma-backup-server.onrender.com/backup', {
      data: backupData
    });

    console.log('Backup successful:', response.data);
    console.log('Backup data being sent:', JSON.stringify(backupData, null, 2));

    // Update the last backup timestamp
    await new Promise((resolve, reject) => {
      db.run('UPDATE backup_timestamps SET lastBackupTime = CURRENT_TIMESTAMP WHERE id = 1', (err) => {
        if (err) {
          console.error('Failed to update last backup timestamp:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Backup failed:', error.message);
  }
}

function startBackupScheduler() {
  console.log('Starting backup scheduler...');
  backupToRemoteServer(); // Run immediately
  setInterval(backupToRemoteServer, 60 * 60 * 1000); // Run every hour
}

module.exports = { startBackupScheduler };