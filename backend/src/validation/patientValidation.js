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

function validatePatientInput(body) {
  const { fullName, CIN, phone, birthDate, address } = body || {};

  if (typeof fullName !== 'string' || !fullName.trim() || fullName.trim().length > 255) {
    throw validationError('fullName is required and must be 255 characters or fewer');
  }

  if (typeof CIN !== 'string' || !CIN.trim() || CIN.trim().length > 50) {
    throw validationError('CIN is required and must be 50 characters or fewer');
  }

  if (typeof phone !== 'string' || !phone.trim() || phone.trim().length > 50) {
    throw validationError('phone is required and must be 50 characters or fewer');
  }

  if (typeof birthDate !== 'string' || !isValidDate(birthDate)) {
    throw validationError('birthDate must be a valid date in YYYY-MM-DD format');
  }

  if (address !== undefined && address !== null && typeof address !== 'string') {
    throw validationError('address must be a string');
  }

  return {
    fullName: fullName.trim(),
    CIN: CIN.trim(),
    phone: phone.trim(),
    birthDate,
    address: typeof address === 'string' && address.trim() ? address.trim() : null,
  };
}

module.exports = { validatePatientInput };
