const { query } = require('../config/database');

class DashboardService {
  /**
   * Get dashboard stats for admin
   */
  async getAdminStats() {
    const today = new Date().toISOString().split('T')[0];

    const [employees, attendance, leaves, departments] = await Promise.all([
      query("SELECT COUNT(*) FROM users WHERE status = 'active'"),
      query(`SELECT COUNT(*) FROM attendance WHERE date = $1 AND status IN ('present', 'late')`, [today]),
      query("SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'"),
      query('SELECT COUNT(DISTINCT department) FROM employee_profiles WHERE department IS NOT NULL')
    ]);

    return {
      totalEmployees: parseInt(employees.rows[0].count),
      presentToday: parseInt(attendance.rows[0].count),
      pendingLeaves: parseInt(leaves.rows[0].count),
      totalDepartments: parseInt(departments.rows[0].count)
    };
  }

  /**
   * Get dashboard stats for employee
   */
  async getEmployeeStats(userId) {
    const today = new Date().toISOString().split('T')[0];

    const [attendance, leaves, payroll] = await Promise.all([
      query(
        `SELECT status, check_in, check_out FROM attendance WHERE user_id = $1 AND date = $2`,
        [userId, today]
      ),
      query(
        `SELECT COUNT(*) as pending FROM leave_requests WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      ),
      query(
        `SELECT net_salary FROM payroll WHERE user_id = $1 ORDER BY year DESC, month DESC LIMIT 1`,
        [userId]
      )
    ]);

    const todayAttendance = attendance.rows[0] || null;
    
    return {
      todayStatus: todayAttendance?.status || 'not-checked-in',
      checkIn: todayAttendance?.check_in || null,
      checkOut: todayAttendance?.check_out || null,
      pendingLeaves: parseInt(leaves.rows[0].pending),
      lastSalary: payroll.rows[0]?.net_salary ? parseFloat(payroll.rows[0].net_salary) : null
    };
  }

  /**
   * Get recent activity for admin
   */
  async getRecentActivity(limit = 10) {
    const activities = [];

    // Recent leave requests
    const leaves = await query(
      `SELECT lr.id, lr.user_name, lr.type, lr.status, lr.created_at, 'leave' as activity_type
       FROM leave_requests lr
       ORDER BY lr.created_at DESC
       LIMIT $1`,
      [limit]
    );

    for (const leave of leaves.rows) {
      activities.push({
        id: leave.id,
        type: 'leave',
        message: `${leave.user_name} ${leave.status === 'pending' ? 'applied for' : leave.status} ${leave.type} leave`,
        timestamp: leave.created_at,
        status: leave.status
      });
    }

    // Recent attendance
    const today = new Date().toISOString().split('T')[0];
    const attendances = await query(
      `SELECT a.id, ep.first_name, ep.last_name, a.status, a.check_in, a.created_at
       FROM attendance a
       JOIN employee_profiles ep ON ep.user_id = a.user_id
       WHERE a.date = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [today, limit]
    );

    for (const att of attendances.rows) {
      activities.push({
        id: att.id,
        type: 'attendance',
        message: `${att.first_name} ${att.last_name} checked in at ${att.check_in}`,
        timestamp: att.created_at,
        status: att.status
      });
    }

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return activities.slice(0, limit);
  }

  /**
   * Get department-wise statistics
   */
  async getDepartmentStats() {
    const result = await query(
      `SELECT 
         ep.department,
         COUNT(*) as employee_count,
         COUNT(a.id) FILTER (WHERE a.date = CURRENT_DATE AND a.status IN ('present', 'late')) as present_today
       FROM employee_profiles ep
       JOIN users u ON u.id = ep.user_id
       LEFT JOIN attendance a ON a.user_id = ep.user_id AND a.date = CURRENT_DATE
       WHERE u.status = 'active' AND ep.department IS NOT NULL
       GROUP BY ep.department
       ORDER BY employee_count DESC`
    );

    return result.rows.map(row => ({
      department: row.department,
      employeeCount: parseInt(row.employee_count),
      presentToday: parseInt(row.present_today)
    }));
  }
}

module.exports = new DashboardService();
