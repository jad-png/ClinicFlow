const appointmentService = require('../services/appointmentService');
const { validateAppointmentInput } = require('../validation/appointmentValidation');

async function createAppointment(req, res) {
  const appointmentInput = validateAppointmentInput(req.body);
  const appointment = await appointmentService.createAppointment({
    ...appointmentInput,
    createdBy: req.user.id,
  });

  res.status(201).json({ appointment });
}

module.exports = { createAppointment };
