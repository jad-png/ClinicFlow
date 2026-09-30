const allowedStatuses = new Set(['pending', 'confirmed', 'cancelled']);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function validateAppointmentListQuery(query) {
  const { patientId, status, date } = query;

  if (patientId !== undefined && (typeof patientId !== 'string' || !uuidPattern.test(patientId))) {
    throw validationError('patientId must be a valid UUID');
  }

  if (status !== undefined && (typeof status !== 'string' || !allowedStatuses.has(status))) {
    throw validationError('status must be pending, confirmed, or cancelled');
  }

  if (date !== undefined && (typeof date !== 'string' || !isValidDate(date))) {
    throw validationError('date must be a valid date in YYYY-MM-DD format');
  }

  return {
    patientId: patientId || null,
    status: status || null,
    date: date || null,
  };
}

module.exports = { validateAppointmentListQuery };
