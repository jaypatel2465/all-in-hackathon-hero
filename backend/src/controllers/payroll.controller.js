const payrollService = require('../services/payroll.service');
const ApiResponse = require('../utils/apiResponse');

class PayrollController {
  async getPayrollRecords(req, res, next) {
    try {
      // If not admin, only show own records
      const options = { ...req.query };
      if (req.user.role !== 'admin') {
        options.userId = req.user.id;
      }
      const result = await payrollService.getPayrollRecords(options);
      return ApiResponse.paginated(res, result.records, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getPayrollById(req, res, next) {
    try {
      const result = await payrollService.getPayrollById(req.params.id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  async createPayroll(req, res, next) {
    try {
      const result = await payrollService.createPayroll(req.body);
      return ApiResponse.created(res, result, 'Payroll record created');
    } catch (error) {
      next(error);
    }
  }

  async updatePayroll(req, res, next) {
    try {
      const result = await payrollService.updatePayroll(req.params.id, req.body);
      return ApiResponse.success(res, result, 'Payroll updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async processPayroll(req, res, next) {
    try {
      const result = await payrollService.processPayroll(req.params.id);
      return ApiResponse.success(res, result, 'Payroll processed successfully');
    } catch (error) {
      next(error);
    }
  }

  async generateMonthlyPayroll(req, res, next) {
    try {
      const { month } = req.body;
      const result = await payrollService.generateMonthlyPayroll(month);
      return ApiResponse.success(res, result, `Generated payroll for ${result.generated} employees`);
    } catch (error) {
      next(error);
    }
  }

  async getPayrollSummary(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const result = await payrollService.getPayrollSummary(userId);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PayrollController();
