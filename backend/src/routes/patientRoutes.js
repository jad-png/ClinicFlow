const express = require('express');
const patientController = require('../controllers/patientController');
const authenticate = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authenticate, patientController.listPatients);
router.get('/:id', authenticate, patientController.getPatientById);
router.patch('/:id', authenticate, patientController.updatePatient);
router.delete('/:id', authenticate, requireRole('admin'), patientController.deletePatient);
router.post('/', authenticate, patientController.createPatient);

module.exports = router;
