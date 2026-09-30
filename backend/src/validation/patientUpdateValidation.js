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

function validatePatientUpdateInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw validationError('Request body must be an object');
  }

  const allowedFields = new Set(['fullName', 'CIN', 'phone', 'birthDate', 'address']);
  const fields = Object.keys(body);

  if (!fields.length) {
    throw validationError('At least one patient field is required');
  }

  const unknownField = fields.find((field) => !allowedFields.has(field));
  if (unknownField) {
    throw validationError(`Field ${unknownField} cannot be updated`);
  }

  const update = {};

  for (const field of fields) {
    const value = body[field];

    if (field === 'address') {
      if (value !== null && typeof value !== 'string') {
        throw validationError('address must be a string or null');
      }

      update[field] = typeof value === 'string' && value.trim() ? value.trim() : null;
      continue;
    }

    if (typeof value !== 'string' || !value.trim()) {
      throw validationError(`${field} must be a non-empty string`);
    }

    const trimmedValue = value.trim();

    if (field === 'fullName' && trimmedValue.length > 255) {
      throw validationError('fullName must be 255 characters or fewer');
    }

    if (field === 'CIN' && trimmedValue.length > 50) {
      throw validationError('CIN must be 50 characters or fewer');
    }

    if (field === 'phone' && trimmedValue.length > 50) {
      throw validationError('phone must be 50 characters or fewer');
    }

    if (field === 'birthDate' && !isValidDate(trimmedValue)) {
      throw validationError('birthDate must be a valid date in YYYY-MM-DD format');
    }

    update[field] = trimmedValue;
  }

  return update;
}

module.exports = { validatePatientUpdateInput };
