const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, appointmentController.createAppointment);

module.exports = router;
