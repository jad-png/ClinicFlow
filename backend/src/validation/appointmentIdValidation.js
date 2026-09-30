function validateAppointmentId(id) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    const error = new Error('Appointment ID must be a valid UUID');
    error.statusCode = 400;
    throw error;
  }

  return id;
}

module.exports = { validateAppointmentId };
