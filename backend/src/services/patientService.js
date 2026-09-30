const pool = require('../db');

async function createPatient(patient) {
  try {
    const result = await pool.query(
      `INSERT INTO patients (full_name, cin, phone, birth_date, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name AS "fullName", cin AS "CIN", phone,
                 birth_date AS "birthDate", address, created_at AS "createdAt"`,
      [patient.fullName, patient.CIN, patient.phone, patient.birthDate, patient.address],
    );

    return result.rows[0];
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'patients_cin_key') {
      const duplicateError = new Error('CIN already exists');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw error;
  }
}

async function listPatients({ page, limit, search }) {
  const searchPattern = search ? `%${search}%` : null;
  const offset = (page - 1) * limit;

  const filter = `($1::text IS NULL
    OR full_name ILIKE $1
    OR cin ILIKE $1)`;

  const [countResult, patientsResult] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM patients WHERE ${filter}`, [searchPattern]),
    pool.query(
      `SELECT id, full_name AS "fullName", cin AS "CIN", phone,
              birth_date AS "birthDate", address, created_at AS "createdAt"
       FROM patients
       WHERE ${filter}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [searchPattern, limit, offset],
    ),
  ]);

  const total = countResult.rows[0].total;

  return {
    patients: patientsResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
}

async function findPatientById(id) {
  const result = await pool.query(
    `SELECT id, full_name AS "fullName", cin AS "CIN", phone,
            birth_date AS "birthDate", address, created_at AS "createdAt"
     FROM patients
     WHERE id = $1`,
    [id],
  );

  return result.rows[0] || null;
}

async function updatePatient(id, patient) {
  const columns = {
    fullName: 'full_name',
    CIN: 'cin',
    phone: 'phone',
    birthDate: 'birth_date',
    address: 'address',
  };
  const fields = Object.keys(patient);
  const values = fields.map((field) => patient[field]);
  const assignments = fields.map((field, index) => `${columns[field]} = $${index + 1}`);

  try {
    const result = await pool.query(
      `UPDATE patients
       SET ${assignments.join(', ')}
       WHERE id = $${values.length + 1}
       RETURNING id, full_name AS "fullName", cin AS "CIN", phone,
                 birth_date AS "birthDate", address, created_at AS "createdAt"`,
      [...values, id],
    );

    return result.rows[0] || null;
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'patients_cin_key') {
      const duplicateError = new Error('CIN already exists');
      duplicateError.statusCode = 400;
      throw duplicateError;
    }

    throw error;
  }
}

async function deletePatient(id) {
  try {
    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 RETURNING id',
      [id],
    );

    return result.rows[0] || null;
  } catch (error) {
    if (error.code === '23503') {
      const relationshipError = new Error('Patient cannot be deleted while appointments exist');
      relationshipError.statusCode = 400;
      throw relationshipError;
    }

    throw error;
  }
}

module.exports = { createPatient, deletePatient, findPatientById, listPatients, updatePatient };
