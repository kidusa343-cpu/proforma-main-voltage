const sqlite3 = require("sqlite3").verbose();
const path = require('path');
const db = require(path.join(__dirname, '../../config/db'));
// Wrap db.all in a Promise
function dbAll(sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Wrap db.get in a Promise
function dbGet(sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Wrap db.run in a Promise
function dbRun(sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      // Note the 'function' to access 'this'
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

const createProforma = async (proformaData , userId) => {
  const {
    proformaNumber,
    customerName,
    plateNumber,
    vin,
    model,
    referenceNumber,
    deliveryTime,
    validityInDays,
    preparedBy,
    items,
  } = proformaData;
  const dateCreated = new Date().toISOString().slice(0, 10);

  let subTotal = 0;

  // Calculate subtotal
  items.forEach((item) => {
    item.totalPrice = item.quantity * item.unitPrice;
    subTotal += item.totalPrice;
  });

  // Calculate VAT (15%)
  const vat = subTotal * 0.15;
  const totalAmount = subTotal + vat;
  try {
    // Insert into proformas table
    const result = await dbRun(
      `
        INSERT INTO proformas (proformaNumber, customerName, plateNumber, vin, model, referenceNumber, deliveryTime, preparedBy, validityInDays, dateCreated, subTotal, vat, totalAmount, userId, lastModified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        proformaNumber,
        customerName,
        plateNumber,
        vin,
        model,
        referenceNumber,
        deliveryTime,
        preparedBy,
        validityInDays,
        dateCreated,
        subTotal,
        vat,
        totalAmount,
        userId,
      ]
    );

    const proformaId = result.id;

    // Insert items into items table
    for (const item of items) {
      await dbRun(
        `
                INSERT INTO items (proformaId, itemName, unit, quantity, unitPrice, totalPrice, remarks, lastModified)
                VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `,
        [
          proformaId,
          item.itemName,
          item.unit,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
          item.remarks,
        ]
      );
    }

    return { message: "Proforma created", proformaId };
  } catch (error) {
    console.error("Error creating proforma:", error);
    throw new Error(error.message);
  }
};
const getAllProformas = async (userId) => {
    try {
      console.log('proformaController: Fetching proformas for userId:', userId);
      const proformas = await dbAll(
        `SELECT * FROM proformas WHERE userId = ?`,
        [userId]
      );
  
      for (let proforma of proformas) {
        const items = await dbAll(
          `SELECT * FROM items WHERE proformaId = ?`,
          [proforma.id]
        );
        proforma.items = items;
      }
  
      console.log('proformaController: Fetched proformas:', proformas);
      return proformas;
    } catch (error) {
      console.error('proformaController: Error fetching proformas:', error);
      throw error;
    }
  };

// Get Proforma by ID
const getProformaById = async (id) => {
  try {
    const proforma = await dbGet("SELECT * FROM proformas WHERE id = ?", [id]);

    if (!proforma) {
      throw new Error("Proforma not found");
    }

    const items = await dbAll("SELECT * FROM items WHERE proformaId = ?", [id]);

    return { ...proforma, items };
  } catch (error) {
    console.error("Error getting proforma by ID:", error);
    throw new Error(error.message);
  }
};

const updateProforma = async (id, proformaData) => {
  const {
    proformaNumber,
    customerName,
    plateNumber,
    vin,
    model,
    referenceNumber,
    deliveryTime,
    validityInDays,
    preparedBy,
    items,
  } = proformaData;

  let subTotal = 0;
  let vat = 0;
  let totalAmount = 0;

  // If items are provided, calculate subtotal and total
  if (items && Array.isArray(items)) {
    items.forEach((item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      subTotal += item.totalPrice;
    });

    // Calculate VAT (15%)
    vat = subTotal * 0.15;
    totalAmount = subTotal + vat;
  }

  try {
    await dbRun(
      `
            UPDATE proformas 
            SET proformaNumber = ?, customerName = ?, plateNumber = ?, vin = ?, model = ?, referenceNumber = ?, deliveryTime = ?, preparedBy = ?, validityInDays = ?, subTotal = ?, vat = ?, totalAmount = ?, lastModified = CURRENT_TIMESTAMP 
            WHERE id = ?
        `,
      [
        proformaNumber,
        customerName,
        plateNumber,
        vin,
        model,
        referenceNumber,
        deliveryTime,
        preparedBy,
        validityInDays,
        subTotal,
        vat,
        totalAmount,
        id,
      ]
    );

    // If items are provided, update the items
    if (items && Array.isArray(items)) {
      // Delete existing items and insert updated items
      await dbRun(`DELETE FROM items WHERE proformaId = ?`, [id]);

      // Insert new items with lastModified timestamp
      for (const item of items) {
        await dbRun(
          `
                    INSERT INTO items (proformaId, itemName, unit, quantity, unitPrice, totalPrice, remarks, lastModified)
                    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                `,
          [
            id,
            item.itemName,
            item.unit,
            item.quantity,
            item.unitPrice,
            item.totalPrice,
            item.remarks,
          ]
        );
      }
    }

    return { message: "Proforma updated successfully" };
  } catch (error) {
    console.error("Error updating proforma:", error);
    throw new Error(error.message);
  }
};

// Delete Proforma
const deleteProforma = async (id) => {
  try {
    // Delete related items first
    await dbRun("DELETE FROM items WHERE proformaId = ?", [id]);

    // Then delete the proforma
    const result = await dbRun("DELETE FROM proformas WHERE id = ?", [id]);

    if (result.changes === 0) {
      throw new Error("Proforma not found");
    }

    return { message: "Proforma deleted" };
  } catch (error) {
    console.error("Error deleting proforma:", error);
    throw new Error(error.message);
  }
};

module.exports = {
  createProforma,
  getAllProformas,
  getProformaById,
  updateProforma,
  deleteProforma,
};
