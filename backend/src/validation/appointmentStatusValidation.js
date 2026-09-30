const allowedStatuses = new Set(['pending', 'confirmed', 'cancelled']);

function validateAppointmentStatus(status) {
  if (typeof status !== 'string' || !allowedStatuses.has(status)) {
    const error = new Error('status must be pending, confirmed, or cancelled');
    error.statusCode = 400;
    throw error;
  }

  return status;
}

module.exports = { validateAppointmentStatus };
