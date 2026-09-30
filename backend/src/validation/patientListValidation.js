function paginationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function parsePositiveInteger(value, name, maximum) {
  if (!/^\d+$/.test(value)) {
    throw paginationError(`${name} must be a positive integer`);
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number) || number < 1 || (maximum && number > maximum)) {
    const maximumMessage = maximum ? ` and no greater than ${maximum}` : '';
    throw paginationError(`${name} must be a positive integer${maximumMessage}`);
  }

  return number;
}

function validatePatientListQuery(query) {
  const page = query.page === undefined ? 1 : parsePositiveInteger(query.page, 'page');
  const limit = query.limit === undefined ? 10 : parsePositiveInteger(query.limit, 'limit', 100);

  if (query.search !== undefined && typeof query.search !== 'string') {
    throw paginationError('search must be a string');
  }

  return {
    page,
    limit,
    search: query.search ? query.search.trim() : '',
  };
}

module.exports = { validatePatientListQuery };
