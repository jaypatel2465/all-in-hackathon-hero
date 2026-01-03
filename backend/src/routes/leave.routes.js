const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { applyLeaveSchema, updateLeaveStatusSchema, leaveQuerySchema } = require('../validators/leave.validator');

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/', validate(applyLeaveSchema), leaveController.applyLeave);
router.get('/', validate(leaveQuerySchema, 'query'), leaveController.getLeaveRequests);
router.get('/balance', leaveController.getLeaveBalance);
router.get('/pending-count', authorize('admin'), leaveController.getPendingCount);
router.get('/:id', leaveController.getLeaveById);
router.delete('/:id', leaveController.cancelLeave);

// Admin only routes
router.put('/:id/status', authorize('admin'), validate(updateLeaveStatusSchema), leaveController.updateLeaveStatus);

module.exports = router;
