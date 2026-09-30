const authService = require('../services/authService');

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    throw validationError('Email and password are required');
  }

  const result = await authService.login(email.trim().toLowerCase(), password);
  res.json(result);
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
