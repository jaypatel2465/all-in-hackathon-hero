const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const AppError = require('../utils/AppError');
const { logger } = require('../utils/logger');

class AuthService {
  /**
   * Generate access and refresh tokens
   */
  generateTokens(userId) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Register a new user
   */
  async signup(data) {
    const { employeeId, email, password, firstName, lastName, role } = data;

    // Check if email exists
    const existingEmail = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    if (existingEmail.rows.length > 0) {
      throw new AppError('Email already registered', 400);
    }

    // Check if employee ID exists
    const existingEmpId = await query(
      'SELECT id FROM users WHERE employee_id = $1',
      [employeeId]
    );
    if (existingEmpId.rows.length > 0) {
      throw new AppError('Employee ID already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await query(
      `INSERT INTO users (employee_id, email, password, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING id, employee_id, email, status, created_at`,
      [employeeId, email.toLowerCase(), hashedPassword]
    );
    const user = userResult.rows[0];

    // Create user role
    await query(
      'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
      [user.id, role || 'employee']
    );

    // Create employee profile
    await query(
      `INSERT INTO employee_profiles (user_id, first_name, last_name, department, position, date_of_joining)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, firstName, lastName, 'Unassigned', 'New Employee', new Date().toISOString().split('T')[0]]
    );

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Store refresh token
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokens.refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    logger.info(`User registered: ${email}`);

    return {
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        role: role || 'employee',
        firstName,
        lastName
      },
      ...tokens
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user
    const userResult = await query(
      `SELECT u.id, u.employee_id, u.email, u.password, u.status,
              ep.first_name, ep.last_name, ep.avatar, ep.phone, ep.address,
              ep.department, ep.position, ep.date_of_joining, ep.salary
       FROM users u
       LEFT JOIN employee_profiles ep ON ep.user_id = u.id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      throw new AppError('Invalid email or password', 401);
    }

    const user = userResult.rows[0];

    // Check status
    if (user.status !== 'active') {
      throw new AppError('Account is inactive', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Get role
    const roleResult = await query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [user.id]
    );
    const role = roleResult.rows[0]?.role || 'employee';

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Store refresh token
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokens.refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        role,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        department: user.department,
        position: user.position,
        dateOfJoining: user.date_of_joining,
        salary: user.salary
      },
      ...tokens
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Check if token exists in database
      const tokenResult = await query(
        'SELECT id FROM refresh_tokens WHERE user_id = $1 AND token = $2 AND expires_at > NOW()',
        [decoded.userId, refreshToken]
      );

      if (tokenResult.rows.length === 0) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const tokens = this.generateTokens(decoded.userId);

      // Update refresh token
      await query(
        'UPDATE refresh_tokens SET token = $1, expires_at = $2 WHERE user_id = $3 AND token = $4',
        [tokens.refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), decoded.userId, refreshToken]
      );

      return tokens;
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  /**
   * Logout user
   */
  async logout(userId, refreshToken) {
    await query(
      'DELETE FROM refresh_tokens WHERE user_id = $1 AND token = $2',
      [userId, refreshToken]
    );
    logger.info(`User logged out: ${userId}`);
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId) {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    logger.info(`User logged out from all devices: ${userId}`);
  }
}

module.exports = new AuthService();
