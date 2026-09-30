const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

function unauthorized(message) {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
}

async function authenticate(req, res, next) {
  const authorization = req.get('authorization');
  const [scheme, token] = authorization ? authorization.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized('Authentication token is required'));
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await authService.findUserById(payload.sub);

    if (!user) {
      return next(unauthorized('Invalid authentication token'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(unauthorized('Invalid authentication token'));
  }
}

module.exports = authenticate;
