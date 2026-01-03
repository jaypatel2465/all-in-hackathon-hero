const attendanceService = require('../services/attendance.service');
const ApiResponse = require('../utils/apiResponse');

class AttendanceController {
  async checkIn(req, res, next) {
    try {
      const result = await attendanceService.checkIn(req.user.id, req.body.notes);
      return ApiResponse.success(res, result, 'Checked in successfully');
    } catch (error) {
      next(error);
    }
  }

  async checkOut(req, res, next) {
    try {
      const result = await attendanceService.checkOut(req.user.id, req.body.notes);
      return ApiResponse.success(res, result, 'Checked out successfully');
    } catch (error) {
      next(error);
    }
  }

  async getToday(req, res, next) {
    try {
      const result = await attendanceService.getTodayAttendance(req.user.id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      // If not admin, only show own attendance
      const options = { ...req.query };
      if (req.user.role !== 'admin') {
        options.userId = req.user.id;
      }
      const result = await attendanceService.getAttendanceHistory(options);
      return ApiResponse.paginated(res, result.records, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async updateAttendance(req, res, next) {
    try {
      const result = await attendanceService.updateAttendance(req.params.id, req.body);
      return ApiResponse.success(res, result, 'Attendance updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getWeeklySummary(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const result = await attendanceService.getWeeklySummary(userId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttendanceController();
