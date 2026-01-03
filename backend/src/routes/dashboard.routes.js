const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Dashboard routes
router.get('/stats', dashboardController.getStats);
router.get('/activity', authorize('admin'), dashboardController.getRecentActivity);
router.get('/departments', authorize('admin'), dashboardController.getDepartmentStats);

module.exports = router;
