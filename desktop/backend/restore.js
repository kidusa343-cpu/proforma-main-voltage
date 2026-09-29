const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Function to fetch proforma data from the backup server
async function fetchProformaBackup(proformaNumber = null) {
  try {
    console.log('Fetching proforma backup...');
    const url = proformaNumber
      ? `https://proforma-backup-server.onrender.com/proformas?proformaNumber=${encodeURIComponent(proformaNumber)}`
      : 'https://proforma-backup-server.onrender.com/proformas';

    const response = await axios.get(url, {
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch proforma backup');
    }

    console.log('Fetched proforma backup:', response.data);
    return response.data.proformas;
  } catch (error) {
    console.error('Error fetching proforma backup:', error.message);
    throw error;
  }
}

// Function to restore proforma data to SQLite
async function restoreProformaBackup(proformaNumber = null) {
  try {
    const proformas = await fetchProformaBackup(proformaNumber);

    // Connect to the SQLite database
    const dbPath = process.env.NODE_ENV === 'production'
      ? path.join(process.resourcesPath, 'newDatabase.db')
      : path.join(__dirname, 'newDatabase.db');
    const db = new sqlite3.Database(dbPath);

    // Process each proforma
    for (const proforma of proformas) {
      // Upsert the proforma into the proformas table
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT OR REPLACE INTO proformas (id, proformaNumber, customerName, plateNumber, vin, model, referenceNumber, deliveryTime, preparedBy, dateCreated, subTotal, vat, totalAmount, lastModified)
           VALUES (
             (SELECT id FROM proformas WHERE proformaNumber = ?),
             ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
           )`,
          [
            proforma.proformaNumber, // For the SELECT in the subquery
            proforma.proformaNumber,
            proforma.customerName,
            proforma.plateNumber,
            proforma.vin,
            proforma.model,
            proforma.referenceNumber,
            proforma.deliveryTime,
            proforma.preparedBy,
            proforma.dateCreated || new Date().toISOString().slice(0, 10),
            proforma.subTotal || 0,
            proforma.vat || 0,
            proforma.totalAmount || 0,
          ],
          function (err) {
            if (err) {
              reject(err);
            } else {
              resolve({ id: this.lastID || this.changes > 0 ? id : null });
            }
          }
        );
      });

      // Fetch the proformaId (either existing or newly inserted)
      const proformaId = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM proformas WHERE proformaNumber = ?', [proforma.proformaNumber], (err, row) => {
          if (err) reject(err);
          else resolve(row.id);
        });
      });

      // Delete existing items for this proforma
      await new Promise((resolve, reject) => {
        db.run('DELETE FROM items WHERE proformaId = ?', [proformaId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Insert items
      if (proforma.items && proforma.items.length > 0) {
        for (const item of proforma.items) {
          await new Promise((resolve, reject) => {
            db.run(
              `INSERT INTO items (proformaId, itemName, unit, quantity, unitPrice, totalPrice, lastModified)
               VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [
                proformaId,
                item.itemName,
                item.unit,
                item.quantity,
                item.unitPrice,
                item.unitPrice * item.quantity, // Calculate totalPrice
              ],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }
    }

    db.close();
    console.log('Proforma backup restored successfully');
    return { success: true, message: 'Proforma backup restored successfully' };
  } catch (error) {
    console.error('Error restoring proforma backup:', error.message);
    throw error;
  }
}

module.exports = { fetchProformaBackup, restoreProformaBackup };