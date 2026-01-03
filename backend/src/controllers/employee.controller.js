const employeeService = require('../services/employee.service');
const ApiResponse = require('../utils/apiResponse');

class EmployeeController {
  async getProfile(req, res, next) {
    try {
      const profile = await employeeService.getProfile(req.user.id);
      return ApiResponse.success(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await employeeService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, profile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllEmployees(req, res, next) {
    try {
      const result = await employeeService.getAllEmployees(req.query);
      return ApiResponse.paginated(res, result.employees, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      return ApiResponse.success(res, employee);
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body);
      return ApiResponse.success(res, employee, 'Employee updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDepartments(req, res, next) {
    try {
      const departments = await employeeService.getDepartments();
      return ApiResponse.success(res, departments);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
