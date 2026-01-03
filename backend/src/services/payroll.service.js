const { query } = require('../config/database');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

class PayrollService {
  /**
   * Get payroll records with filters
   */
  async getPayrollRecords(options) {
    const { userId, month, year, status, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (userId) {
      whereClause += ` AND p.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (month) {
      whereClause += ` AND p.month = $${paramIndex}`;
      params.push(month);
      paramIndex++;
    }

    if (year) {
      whereClause += ` AND p.year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) FROM payroll p ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT p.*, ep.first_name, ep.last_name, u.employee_id
       FROM payroll p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN employee_profiles ep ON ep.user_id = p.user_id
       ${whereClause}
       ORDER BY p.year DESC, p.month DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const records = result.rows.map(row => ({
      ...this.formatPayrollRecord(row),
      employeeName: row.first_name && row.last_name 
        ? `${row.first_name} ${row.last_name}` 
        : row.employee_id,
      employeeId: row.employee_id
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
   * Get payroll record by ID
   */
  async getPayrollById(payrollId) {
    const result = await query(
      `SELECT p.*, ep.first_name, ep.last_name, u.employee_id
       FROM payroll p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN employee_profiles ep ON ep.user_id = p.user_id
       WHERE p.id = $1`,
      [payrollId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Payroll record not found', 404);
    }

    return {
      ...this.formatPayrollRecord(result.rows[0]),
      employeeName: result.rows[0].first_name && result.rows[0].last_name 
        ? `${result.rows[0].first_name} ${result.rows[0].last_name}` 
        : result.rows[0].employee_id
    };
  }

  /**
   * Create payroll record (admin only)
   */
  async createPayroll(data) {
    const { userId, month, basicSalary, allowances = 0, deductions = 0, notes } = data;

    // Check if payroll already exists for this month
    const existing = await query(
      'SELECT id FROM payroll WHERE user_id = $1 AND month = $2',
      [userId, month]
    );

    if (existing.rows.length > 0) {
      throw new AppError('Payroll already exists for this month', 400);
    }

    // Verify user exists
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    const netSalary = basicSalary + allowances - deductions;
    const [year, monthNum] = month.split('-').map(Number);

    const result = await query(
      `INSERT INTO payroll (user_id, month, year, basic_salary, allowances, deductions, net_salary, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
       RETURNING *`,
      [userId, month, year, basicSalary, allowances, deductions, netSalary, notes]
    );

    logger.info(`Payroll created for user ${userId} for ${month}`);
    return this.formatPayrollRecord(result.rows[0]);
  }

  /**
   * Update payroll record (admin only)
   */
  async updatePayroll(payrollId, data) {
    const { basicSalary, allowances, deductions, status, notes } = data;

    // Get current record
    const current = await query('SELECT * FROM payroll WHERE id = $1', [payrollId]);
    if (current.rows.length === 0) {
      throw new AppError('Payroll record not found', 404);
    }

    const currentRecord = current.rows[0];
    const newBasicSalary = basicSalary ?? currentRecord.basic_salary;
    const newAllowances = allowances ?? currentRecord.allowances;
    const newDeductions = deductions ?? currentRecord.deductions;
    const netSalary = newBasicSalary + newAllowances - newDeductions;

    const result = await query(
      `UPDATE payroll
       SET basic_salary = $1,
           allowances = $2,
           deductions = $3,
           net_salary = $4,
           status = COALESCE($5, status),
           notes = COALESCE($6, notes),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [newBasicSalary, newAllowances, newDeductions, netSalary, status, notes, payrollId]
    );

    logger.info(`Payroll ${payrollId} updated`);
    return this.formatPayrollRecord(result.rows[0]);
  }

  /**
   * Process payroll (mark as paid)
   */
  async processPayroll(payrollId) {
    const result = await query(
      `UPDATE payroll
       SET status = 'paid', paid_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [payrollId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Payroll not found or already paid', 400);
    }

    logger.info(`Payroll ${payrollId} processed`);
    return this.formatPayrollRecord(result.rows[0]);
  }

  /**
   * Generate payroll for all employees for a month (admin only)
   */
  async generateMonthlyPayroll(month) {
    // Get all active employees with salary
    const employees = await query(
      `SELECT u.id, ep.salary
       FROM users u
       JOIN employee_profiles ep ON ep.user_id = u.id
       WHERE u.status = 'active' AND ep.salary > 0`
    );

    const [year] = month.split('-').map(Number);
    const results = [];

    for (const emp of employees.rows) {
      // Check if payroll exists
      const existing = await query(
        'SELECT id FROM payroll WHERE user_id = $1 AND month = $2',
        [emp.id, month]
      );

      if (existing.rows.length === 0) {
        const result = await query(
          `INSERT INTO payroll (user_id, month, year, basic_salary, allowances, deductions, net_salary, status)
           VALUES ($1, $2, $3, $4, 0, 0, $4, 'pending')
           RETURNING *`,
          [emp.id, month, year, emp.salary]
        );
        results.push(this.formatPayrollRecord(result.rows[0]));
      }
    }

    logger.info(`Generated payroll for ${results.length} employees for ${month}`);
    return { generated: results.length, records: results };
  }

  /**
   * Get payroll summary for user
   */
  async getPayrollSummary(userId) {
    const result = await query(
      `SELECT 
         COALESCE(SUM(net_salary) FILTER (WHERE status = 'paid'), 0) as total_earned,
         COALESCE(SUM(net_salary) FILTER (WHERE status = 'pending'), 0) as pending,
         COUNT(*) FILTER (WHERE status = 'paid') as paid_months,
         MAX(net_salary) as last_salary
       FROM payroll
       WHERE user_id = $1
         AND year = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [userId]
    );

    return {
      totalEarned: parseFloat(result.rows[0].total_earned),
      pending: parseFloat(result.rows[0].pending),
      paidMonths: parseInt(result.rows[0].paid_months),
      lastSalary: parseFloat(result.rows[0].last_salary) || 0
    };
  }

  /**
   * Format payroll record for API response
   */
  formatPayrollRecord(row) {
    return {
      id: row.id,
      userId: row.user_id,
      month: row.month,
      year: row.year,
      basicSalary: parseFloat(row.basic_salary),
      allowances: parseFloat(row.allowances),
      deductions: parseFloat(row.deductions),
      netSalary: parseFloat(row.net_salary),
      status: row.status,
      notes: row.notes,
      paidAt: row.paid_at,
      createdAt: row.created_at
    };
  }
}

module.exports = new PayrollService();
