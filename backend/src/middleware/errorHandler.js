const handledStatusCodes = new Set([400, 401, 403, 404, 500]);

function notFoundHandler(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const requestedStatus = Number(error.statusCode || error.status);
  const statusCode = handledStatusCodes.has(requestedStatus) ? requestedStatus : 500;

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : error.message,
  });
}

module.exports = { errorHandler, notFoundHandler };
