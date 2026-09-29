const express = require('express');
const router = express.Router();
const {
    createProforma,
    getAllProformas,
    getProformaById,
    updateProforma,
    deleteProforma,
} = require('../controllers/proformaController');
const protectRoute = require('../middleware/protectRoutes');
// Create a new proforma,
router.post('/proformas',protectRoute, createProforma);

// Get all proformas
router.get('/proformas',protectRoute, getAllProformas);

// Get a specific proforma by ID
router.get('/proformas/:id',protectRoute, getProformaById);

// Update a proforma by ID
router.put('/proformas/:id', protectRoute,updateProforma);

// Delete a proforma by ID
router.delete('/proformas/:id',protectRoute, deleteProforma);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const {
//   createProforma,
//   getAllProformas,
//   getProformaById,
//   deleteProforma,
//   updateProforma
// } = require('../controllers/proformaController');

// router.post('/proforma', createProforma);
// router.get('/proformas', getAllProformas);
// router.get('/proforma/:id', getProformaById);
// router.put('/Updateproforma/:id', updateProforma);
// router.delete('/Deleteproformas/:id',deleteProforma);
// module.exports = router;