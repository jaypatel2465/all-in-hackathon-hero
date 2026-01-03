const leaveService = require('../services/leave.service');
const ApiResponse = require('../utils/apiResponse');

class LeaveController {
  async applyLeave(req, res, next) {
    try {
      const result = await leaveService.applyLeave(req.user.id, req.body);
      return ApiResponse.created(res, result, 'Leave request submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getLeaveRequests(req, res, next) {
    try {
      // If not admin, only show own requests
      const options = { ...req.query };
      if (req.user.role !== 'admin') {
        options.userId = req.user.id;
      }
      const result = await leaveService.getLeaveRequests(options);
      return ApiResponse.paginated(res, result.requests, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getLeaveById(req, res, next) {
    try {
      const result = await leaveService.getLeaveById(req.params.id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async updateLeaveStatus(req, res, next) {
    try {
      const result = await leaveService.updateLeaveStatus(req.params.id, req.body, req.user.id);
      return ApiResponse.success(res, result, `Leave request ${req.body.status}`);
    } catch (error) {
      next(error);
    }
  }

  async cancelLeave(req, res, next) {
    try {
      const result = await leaveService.cancelLeave(req.params.id, req.user.id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getLeaveBalance(req, res, next) {
    try {
      const result = await leaveService.getLeaveBalance(req.user.id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getPendingCount(req, res, next) {
    try {
      const count = await leaveService.getPendingCount();
      return ApiResponse.success(res, { count });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeaveController();
