const prisma = require('../prisma');

function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  return { start, end };
}

async function getDashboardSummary() {
  const { start, end } = getTodayRange();
  const [totalPatients, todaysAppointments, pendingAppointments, confirmedAppointments] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({
      where: { appointmentDate: { gte: start, lt: end } },
    }),
    prisma.appointment.count({ where: { status: 'pending' } }),
    prisma.appointment.count({ where: { status: 'confirmed' } }),
  ]);

  return {
    totalPatients,
    todaysAppointments,
    pendingAppointments,
    confirmedAppointments,
  };
}

module.exports = { getDashboardSummary };
