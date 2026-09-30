const allowedStatuses = new Set(['pending', 'confirmed', 'cancelled']);

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validateAppointmentInput(body) {
  const { patientId, appointmentDate, status, reason, notes } = body || {};
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (typeof patientId !== 'string' || !uuidPattern.test(patientId)) {
    throw validationError('patientId must be a valid UUID');
  }

  if (typeof appointmentDate !== 'string' || Number.isNaN(Date.parse(appointmentDate))) {
    throw validationError('appointmentDate must be a valid date');
  }

  if (typeof status !== 'string' || !allowedStatuses.has(status)) {
    throw validationError('status must be pending, confirmed, or cancelled');
  }

  if (typeof reason !== 'string' || !reason.trim()) {
    throw validationError('reason is required');
  }

  if (notes !== undefined && notes !== null && typeof notes !== 'string') {
    throw validationError('notes must be a string');
  }

  return {
    patientId,
    appointmentDate,
    status,
    reason: reason.trim(),
    notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
  };
}

module.exports = { validateAppointmentInput };
