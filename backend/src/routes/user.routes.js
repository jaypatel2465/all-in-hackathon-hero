const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateProfileSchema, paginationSchema } = require('../validators/employee.validator');

// All routes require authentication
router.use(authenticate);

// User profile routes
router.get('/profile', employeeController.getProfile);
router.put('/profile', validate(updateProfileSchema), employeeController.updateProfile);

module.exports = router;
