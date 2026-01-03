const { query } = require('../config/database');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

class AttendanceService {
  /**
   * Check in for the day
   */
  async checkIn(userId, notes = null) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in today
    const existing = await query(
      'SELECT id, check_in FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (existing.rows.length > 0 && existing.rows[0].check_in) {
      throw new AppError('Already checked in today', 400);
    }

    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0];
    
    // Determine status (late if after 9:30 AM)
    const lateThreshold = new Date(now);
    lateThreshold.setHours(9, 30, 0, 0);
    const status = now > lateThreshold ? 'late' : 'present';

    let result;
    if (existing.rows.length > 0) {
      // Update existing record
      result = await query(
        `UPDATE attendance
         SET check_in = $1, status = $2, notes = COALESCE($3, notes), updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [checkInTime, status, notes, existing.rows[0].id]
      );
    } else {
      // Create new record
      result = await query(
        `INSERT INTO attendance (user_id, date, check_in, status, notes)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, today, checkInTime, status, notes]
      );
    }

    logger.info(`User ${userId} checked in at ${checkInTime}`);
    return this.formatAttendanceRecord(result.rows[0]);
  }

  /**
   * Check out for the day
   */
  async checkOut(userId, notes = null) {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if checked in today
    const existing = await query(
      'SELECT id, check_in, check_out FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (existing.rows.length === 0 || !existing.rows[0].check_in) {
      throw new AppError('Must check in before checking out', 400);
    }

    if (existing.rows[0].check_out) {
      throw new AppError('Already checked out today', 400);
    }

    const checkOutTime = new Date().toTimeString().split(' ')[0];
    
    // Calculate work hours
    const checkIn = existing.rows[0].check_in;
    const [inH, inM] = checkIn.split(':').map(Number);
    const [outH, outM] = checkOutTime.split(':').map(Number);
    const workHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;

    // Update status to half-day if less than 4 hours
    const currentStatus = await query('SELECT status FROM attendance WHERE id = $1', [existing.rows[0].id]);
    let status = currentStatus.rows[0].status;
    if (workHours < 4) {
      status = 'half-day';
    }

    const result = await query(
      `UPDATE attendance
       SET check_out = $1, work_hours = $2, status = $3, notes = COALESCE($4, notes), updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [checkOutTime, Math.round(workHours * 100) / 100, status, notes, existing.rows[0].id]
    );

    logger.info(`User ${userId} checked out at ${checkOutTime}`);
    return this.formatAttendanceRecord(result.rows[0]);
  }

  /**
   * Get today's attendance for user
   */
  async getTodayAttendance(userId) {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [userId, today]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.formatAttendanceRecord(result.rows[0]);
  }

  /**
   * Get attendance history with pagination
   */
  async getAttendanceHistory(options) {
    const { userId, startDate, endDate, status, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (userId) {
      whereClause += ` AND a.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (startDate) {
      whereClause += ` AND a.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereClause += ` AND a.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM attendance a ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT a.*, ep.first_name, ep.last_name, u.employee_id
       FROM attendance a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN employee_profiles ep ON ep.user_id = a.user_id
       ${whereClause}
       ORDER BY a.date DESC, a.check_in DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const records = result.rows.map(row => ({
      ...this.formatAttendanceRecord(row),
      userName: row.first_name && row.last_name 
        ? `${row.first_name} ${row.last_name}` 
        : row.employee_id
    }));

    return {
      records,
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
   * Update attendance record (admin only)
   */
  async updateAttendance(attendanceId, data) {
    const { status, checkIn, checkOut, notes } = data;

    const result = await query(
      `UPDATE attendance
       SET status = COALESCE($1, status),
           check_in = COALESCE($2, check_in),
           check_out = COALESCE($3, check_out),
           notes = COALESCE($4, notes),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [status, checkIn, checkOut, notes, attendanceId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Attendance record not found', 404);
    }

    logger.info(`Attendance ${attendanceId} updated by admin`);
    return this.formatAttendanceRecord(result.rows[0]);
  }

  /**
   * Get weekly summary for user
   */
  async getWeeklySummary(userId) {
    const result = await query(
      `SELECT 
         COUNT(*) FILTER (WHERE status = 'present') as present_days,
         COUNT(*) FILTER (WHERE status = 'late') as late_days,
         COUNT(*) FILTER (WHERE status = 'absent') as absent_days,
         COUNT(*) FILTER (WHERE status = 'half-day') as half_days,
         COALESCE(SUM(work_hours), 0) as total_hours
       FROM attendance
       WHERE user_id = $1
         AND date >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    return {
      presentDays: parseInt(result.rows[0].present_days),
      lateDays: parseInt(result.rows[0].late_days),
      absentDays: parseInt(result.rows[0].absent_days),
      halfDays: parseInt(result.rows[0].half_days),
      totalHours: parseFloat(result.rows[0].total_hours) || 0
    };
  }

  /**
   * Format attendance record for API response
   */
  formatAttendanceRecord(row) {
    return {
      id: row.id,
      userId: row.user_id,
      date: row.date,
      checkIn: row.check_in,
      checkOut: row.check_out,
      status: row.status,
      workHours: row.work_hours,
      notes: row.notes,
      createdAt: row.created_at
    };
  }
}

module.exports = new AttendanceService();
