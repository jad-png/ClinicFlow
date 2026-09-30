function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      const error = new Error('Insufficient permissions');
      error.statusCode = 403;
      return next(error);
    }

    return next();
  };
}

module.exports = requireRole;
