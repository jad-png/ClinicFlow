const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const bcryptRounds = 12;

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return process.env.JWT_SECRET;
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
    [email],
  );

  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await pool.query(
    'SELECT id, email, role FROM users WHERE id = $1',
    [id],
  );

  return result.rows[0] || null;
}

async function hashPassword(password) {
  return bcrypt.hash(password, bcryptRounds);
}

async function login(email, password) {
  const user = await findUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const publicUser = toPublicUser(user);
  const token = jwt.sign(
    { sub: publicUser.id, email: publicUser.email, role: publicUser.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
  );

  return { token, user: publicUser };
}

module.exports = {
  findUserById,
  hashPassword,
  login,
};
