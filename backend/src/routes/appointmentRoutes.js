const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, appointmentController.listAppointments);
router.post('/', authenticate, appointmentController.createAppointment);
router.patch('/:id/status', authenticate, appointmentController.updateAppointmentStatus);

module.exports = router;
