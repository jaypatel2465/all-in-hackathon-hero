const { query } = require('../config/database');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

class LeaveService {
  /**
   * Apply for leave
   */
  async applyLeave(userId, data) {
    const { type, startDate, endDate, reason } = data;

    // Get user name
    const userResult = await query(
      `SELECT ep.first_name, ep.last_name FROM employee_profiles ep WHERE ep.user_id = $1`,
      [userId]
    );
    const userName = userResult.rows[0] 
      ? `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`
      : 'Unknown';

    // Check for overlapping leave requests
    const overlap = await query(
      `SELECT id FROM leave_requests
       WHERE user_id = $1
         AND status != 'rejected'
         AND (
           (start_date <= $2 AND end_date >= $2) OR
           (start_date <= $3 AND end_date >= $3) OR
           (start_date >= $2 AND end_date <= $3)
         )`,
      [userId, startDate, endDate]
    );

    if (overlap.rows.length > 0) {
      throw new AppError('You already have a leave request for these dates', 400);
    }

    const result = await query(
      `INSERT INTO leave_requests (user_id, user_name, type, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, userName, type, startDate, endDate, reason]
    );

    logger.info(`Leave request created by user ${userId}`);
    return this.formatLeaveRequest(result.rows[0]);
  }

  /**
   * Get leave requests with filters
   */
  async getLeaveRequests(options) {
    const { userId, status, type, startDate, endDate, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (userId) {
      whereClause += ` AND lr.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND lr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND lr.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (startDate) {
      whereClause += ` AND lr.start_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereClause += ` AND lr.end_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM leave_requests lr ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT lr.*, ep.first_name, ep.last_name, ep.department
       FROM leave_requests lr
       JOIN users u ON u.id = lr.user_id
       LEFT JOIN employee_profiles ep ON ep.user_id = lr.user_id
       ${whereClause}
       ORDER BY lr.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const requests = result.rows.map(row => ({
      ...this.formatLeaveRequest(row),
      employeeName: row.first_name && row.last_name 
        ? `${row.first_name} ${row.last_name}` 
        : row.user_name,
      department: row.department
    }));

    return {
      requests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount
      }
    };
  }

  /**
   * Get leave request by ID
   */
  async getLeaveById(leaveId) {
    const result = await query(
      `SELECT lr.*, ep.first_name, ep.last_name, ep.department
       FROM leave_requests lr
       LEFT JOIN employee_profiles ep ON ep.user_id = lr.user_id
       WHERE lr.id = $1`,
      [leaveId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Leave request not found', 404);
    }

    return {
      ...this.formatLeaveRequest(result.rows[0]),
      employeeName: result.rows[0].first_name && result.rows[0].last_name 
        ? `${result.rows[0].first_name} ${result.rows[0].last_name}` 
        : result.rows[0].user_name,
      department: result.rows[0].department
    };
  }

  /**
   * Update leave request status (admin only)
   */
  async updateLeaveStatus(leaveId, data, adminId) {
    const { status, adminComment } = data;

    // Verify request exists and is pending
    const existing = await query(
      'SELECT status FROM leave_requests WHERE id = $1',
      [leaveId]
    );

    if (existing.rows.length === 0) {
      throw new AppError('Leave request not found', 404);
    }

    if (existing.rows[0].status !== 'pending') {
      throw new AppError('Can only update pending requests', 400);
    }

    const result = await query(
      `UPDATE leave_requests
       SET status = $1, admin_comment = $2, reviewed_by = $3, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, adminComment, adminId, leaveId]
    );

    logger.info(`Leave ${leaveId} ${status} by admin ${adminId}`);
    return this.formatLeaveRequest(result.rows[0]);
  }

  /**
   * Cancel leave request (by employee)
   */
  async cancelLeave(leaveId, userId) {
    const existing = await query(
      'SELECT user_id, status FROM leave_requests WHERE id = $1',
      [leaveId]
    );

    if (existing.rows.length === 0) {
      throw new AppError('Leave request not found', 404);
    }

    if (existing.rows[0].user_id !== userId) {
      throw new AppError('Not authorized to cancel this request', 403);
    }

    if (existing.rows[0].status !== 'pending') {
      throw new AppError('Can only cancel pending requests', 400);
    }

    await query('DELETE FROM leave_requests WHERE id = $1', [leaveId]);
    
    logger.info(`Leave ${leaveId} cancelled by user ${userId}`);
    return { message: 'Leave request cancelled' };
  }

  /**
   * Get leave balance for user
   */
  async getLeaveBalance(userId) {
    // This would typically come from company policy/configuration
    const totalPaidLeave = 20;
    const totalSickLeave = 10;

    const usedResult = await query(
      `SELECT 
         COUNT(*) FILTER (WHERE type = 'paid' AND status = 'approved') as used_paid,
         COUNT(*) FILTER (WHERE type = 'sick' AND status = 'approved') as used_sick
       FROM leave_requests
       WHERE user_id = $1
         AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [userId]
    );

    const usedPaid = parseInt(usedResult.rows[0].used_paid) || 0;
    const usedSick = parseInt(usedResult.rows[0].used_sick) || 0;

    return {
      paidLeave: { total: totalPaidLeave, used: usedPaid, remaining: totalPaidLeave - usedPaid },
      sickLeave: { total: totalSickLeave, used: usedSick, remaining: totalSickLeave - usedSick }
    };
  }

  /**
   * Get pending leave count
   */
  async getPendingCount() {
    const result = await query(
      "SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'"
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Format leave request for API response
   */
  formatLeaveRequest(row) {
    return {
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      type: row.type,
      startDate: row.start_date,
      endDate: row.end_date,
      reason: row.reason,
      status: row.status,
      adminComment: row.admin_comment,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      createdAt: row.created_at
    };
  }
}

module.exports = new LeaveService();
