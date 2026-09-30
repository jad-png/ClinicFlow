const dashboardService = require('../services/dashboardService');

async function getDashboard(req, res) {
  const summary = await dashboardService.getDashboardSummary();

  res.json(summary);
}

module.exports = { getDashboard };
