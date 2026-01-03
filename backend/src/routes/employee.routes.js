const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { paginationSchema } = require('../validators/employee.validator');

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.get('/', authorize('admin'), validate(paginationSchema, 'query'), employeeController.getAllEmployees);
router.get('/departments', authorize('admin'), employeeController.getDepartments);
router.get('/:id', authorize('admin'), employeeController.getEmployeeById);
router.put('/:id', authorize('admin'), employeeController.updateEmployee);

module.exports = router;
