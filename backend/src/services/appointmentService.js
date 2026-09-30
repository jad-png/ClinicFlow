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

  if (appointment.status === 'confirmed') {
    const conflictResult = await pool.query(
      `SELECT 1
       FROM appointments
       WHERE patient_id = $1
         AND status = 'confirmed'
         AND appointment_date BETWEEN $2::timestamptz - INTERVAL '30 minutes'
                                  AND $2::timestamptz + INTERVAL '30 minutes'
       LIMIT 1`,
      [appointment.patientId, appointment.appointmentDate],
    );

    if (conflictResult.rows[0]) {
      const error = new Error('Patient has a confirmed appointment within 30 minutes');
      error.statusCode = 400;
      throw error;
    }
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

async function listAppointments({ patientId, status, date }) {
  const result = await pool.query(
    `SELECT a.id,
            a.patient_id AS "patientId",
            a.appointment_date AS "appointmentDate",
            a.status,
            a.reason,
            a.notes,
            a.created_by AS "createdBy",
            p.full_name AS "patientName",
            p.cin AS "patientCIN",
            p.phone AS "patientPhone"
     FROM appointments a
     INNER JOIN patients p ON p.id = a.patient_id
     WHERE ($1::uuid IS NULL OR a.patient_id = $1)
       AND ($2::text IS NULL OR a.status = $2)
       AND ($3::date IS NULL OR a.appointment_date::date = $3)
     ORDER BY a.appointment_date ASC`,
    [patientId, status, date],
  );

  return result.rows;
}

async function updateAppointmentStatus(id, status) {
  const result = await pool.query(
    `UPDATE appointments
     SET status = $1
     WHERE id = $2
     RETURNING id, patient_id AS "patientId", appointment_date AS "appointmentDate",
               status, reason, notes, created_by AS "createdBy"`,
    [status, id],
  );

  return result.rows[0] || null;
}

module.exports = { createAppointment, listAppointments, updateAppointmentStatus };
