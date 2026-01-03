const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/apiResponse');

class DashboardController {
  async getStats(req, res, next) {
    try {
      let stats;
      if (req.user.role === 'admin') {
        stats = await dashboardService.getAdminStats();
      } else {
        stats = await dashboardService.getEmployeeStats(req.user.id);
      }
      return ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities = await dashboardService.getRecentActivity(limit);
      return ApiResponse.success(res, activities);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentStats(req, res, next) {
    try {
      const stats = await dashboardService.getDepartmentStats();
      return ApiResponse.success(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
