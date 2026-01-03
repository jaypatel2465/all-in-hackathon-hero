const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { checkInSchema, checkOutSchema, attendanceQuerySchema, updateAttendanceSchema } = require('../validators/attendance.validator');

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/check-in', validate(checkInSchema), attendanceController.checkIn);
router.post('/check-out', validate(checkOutSchema), attendanceController.checkOut);
router.get('/today', attendanceController.getToday);
router.get('/history', validate(attendanceQuerySchema, 'query'), attendanceController.getHistory);
router.get('/weekly-summary', attendanceController.getWeeklySummary);
router.get('/weekly-summary/:userId', authorize('admin'), attendanceController.getWeeklySummary);

// Admin only routes
router.put('/:id', authorize('admin'), validate(updateAttendanceSchema), attendanceController.updateAttendance);

module.exports = router;
