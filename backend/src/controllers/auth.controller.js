const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      return ApiResponse.created(res, result, 'Account created successfully');
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      return ApiResponse.success(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(req.user.id, refreshToken);
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.user.id);
      return ApiResponse.success(res, null, 'Logged out from all devices');
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const employeeService = require('../services/employee.service');
      const profile = await employeeService.getProfile(req.user.id);
      return ApiResponse.success(res, profile);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
