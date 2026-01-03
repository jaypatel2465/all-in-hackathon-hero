const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payroll.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createPayrollSchema, updatePayrollSchema, payrollQuerySchema } = require('../validators/payroll.validator');

// All routes require authentication
router.use(authenticate);

// Employee can view own payroll
router.get('/', validate(payrollQuerySchema, 'query'), payrollController.getPayrollRecords);
router.get('/summary', payrollController.getPayrollSummary);
router.get('/summary/:userId', authorize('admin'), payrollController.getPayrollSummary);
router.get('/:id', payrollController.getPayrollById);

// Admin only routes
router.post('/', authorize('admin'), validate(createPayrollSchema), payrollController.createPayroll);
router.post('/generate', authorize('admin'), payrollController.generateMonthlyPayroll);
router.put('/:id', authorize('admin'), validate(updatePayrollSchema), payrollController.updatePayroll);
router.post('/:id/process', authorize('admin'), payrollController.processPayroll);

module.exports = router;
