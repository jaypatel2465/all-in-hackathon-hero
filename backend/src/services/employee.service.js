const { query } = require('../config/database');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

class EmployeeService {
  /**
   * Get employee profile by user ID
   */
  async getProfile(userId) {
    const result = await query(
      `SELECT u.id, u.employee_id, u.email, u.status, u.created_at,
              ep.first_name, ep.last_name, ep.avatar, ep.phone, ep.address,
              ep.department, ep.position, ep.date_of_joining, ep.salary,
              ur.role
       FROM users u
       LEFT JOIN employee_profiles ep ON ep.user_id = u.id
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Employee not found', 404);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      employeeId: row.employee_id,
      email: row.email,
      role: row.role || 'employee',
      firstName: row.first_name,
      lastName: row.last_name,
      avatar: row.avatar,
      phone: row.phone,
      address: row.address,
      department: row.department,
      position: row.position,
      dateOfJoining: row.date_of_joining,
      salary: row.salary,
      status: row.status,
      createdAt: row.created_at
    };
  }

  /**
   * Update employee profile
   */
  async updateProfile(userId, data) {
    const { firstName, lastName, phone, address, avatar } = data;

    const result = await query(
      `UPDATE employee_profiles
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           avatar = COALESCE($5, avatar),
           updated_at = NOW()
       WHERE user_id = $6
       RETURNING *`,
      [firstName, lastName, phone, address, avatar, userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Profile not found', 404);
    }

    logger.info(`Profile updated: ${userId}`);
    return this.getProfile(userId);
  }

  /**
   * Get all employees with pagination
   */
  async getAllEmployees(options) {
    const { page = 1, limit = 10, search, department, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE u.status = 'active'";
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (ep.first_name ILIKE $${paramIndex} OR ep.last_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.employee_id ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (department) {
      whereClause += ` AND ep.department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['created_at', 'first_name', 'last_name', 'department', 'position'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const countResult = await query(
      `SELECT COUNT(*) FROM users u
       LEFT JOIN employee_profiles ep ON ep.user_id = u.id
       ${whereClause}`,
      params
    );

    const totalCount = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT u.id, u.employee_id, u.email, u.status, u.created_at,
              ep.first_name, ep.last_name, ep.avatar, ep.phone,
              ep.department, ep.position, ep.date_of_joining, ep.salary,
              ur.role
       FROM users u
       LEFT JOIN employee_profiles ep ON ep.user_id = u.id
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       ${whereClause}
       ORDER BY ${safeSortBy === 'first_name' || safeSortBy === 'last_name' || safeSortBy === 'department' || safeSortBy === 'position' ? 'ep.' + safeSortBy : 'u.' + safeSortBy} ${safeSortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const employees = result.rows.map(row => ({
      id: row.id,
      employeeId: row.employee_id,
      email: row.email,
      role: row.role || 'employee',
      firstName: row.first_name,
      lastName: row.last_name,
      avatar: row.avatar,
      phone: row.phone,
      department: row.department,
      position: row.position,
      dateOfJoining: row.date_of_joining,
      salary: row.salary,
      status: row.status
    }));

    return {
      employees,
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
   * Get employee by ID (admin only)
   */
  async getEmployeeById(userId) {
    return this.getProfile(userId);
  }

  /**
   * Update employee details (admin only)
   */
  async updateEmployee(userId, data) {
    const { department, position, salary, status } = data;

    // Update profile
    if (department || position || salary !== undefined) {
      await query(
        `UPDATE employee_profiles
         SET department = COALESCE($1, department),
             position = COALESCE($2, position),
             salary = COALESCE($3, salary),
             updated_at = NOW()
         WHERE user_id = $4`,
        [department, position, salary, userId]
      );
    }

    // Update user status
    if (status) {
      await query(
        'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2',
        [status, userId]
      );
    }

    logger.info(`Employee updated by admin: ${userId}`);
    return this.getProfile(userId);
  }

  /**
   * Get departments list
   */
  async getDepartments() {
    const result = await query(
      `SELECT DISTINCT department, COUNT(*) as employee_count
       FROM employee_profiles
       WHERE department IS NOT NULL
       GROUP BY department
       ORDER BY department`
    );

    return result.rows;
  }
}

module.exports = new EmployeeService();
