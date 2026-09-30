const appointmentService = require('../services/appointmentService');
const { validateAppointmentId } = require('../validation/appointmentIdValidation');
const { validateAppointmentListQuery } = require('../validation/appointmentListValidation');
const { validateAppointmentInput } = require('../validation/appointmentValidation');
const { validateAppointmentStatus } = require('../validation/appointmentStatusValidation');

async function createAppointment(req, res) {
  const appointmentInput = validateAppointmentInput(req.body);
  const appointment = await appointmentService.createAppointment({
    ...appointmentInput,
    createdBy: req.user.id,
  });

  res.status(201).json({ appointment });
}

async function listAppointments(req, res) {
  const filters = validateAppointmentListQuery(req.query);
  const appointments = await appointmentService.listAppointments(filters);

  res.json({ appointments });
}

async function updateAppointmentStatus(req, res) {
  const appointmentId = validateAppointmentId(req.params.id);
  const status = validateAppointmentStatus(req.body && req.body.status);
  const appointment = await appointmentService.updateAppointmentStatus(appointmentId, status);

  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ appointment });
}

module.exports = { createAppointment, listAppointments, updateAppointmentStatus };
