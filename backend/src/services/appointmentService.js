const pool = require('../db');

async function createAppointment(appointment) {
  const patientResult = await pool.query(
    'SELECT id FROM patients WHERE id = $1',
    [appointment.patientId],
  );

  if (!patientResult.rows[0]) {
    const error = new Error('Patient not found');
    error.statusCode = 404;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO appointments
       (patient_id, appointment_date, status, reason, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, patient_id AS "patientId", appointment_date AS "appointmentDate",
               status, reason, notes, created_by AS "createdBy"`,
    [
      appointment.patientId,
      appointment.appointmentDate,
      appointment.status,
      appointment.reason,
      appointment.notes,
      appointment.createdBy,
    ],
  );

  return result.rows[0];
}

module.exports = { createAppointment };
