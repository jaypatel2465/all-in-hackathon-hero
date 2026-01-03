const { z } = require('zod');

const signupSchema = z.object({
  employeeId: z.string()
    .min(3, 'Employee ID must be at least 3 characters')
    .max(20, 'Employee ID must be less than 20 characters')
    .regex(/^[A-Za-z0-9]+$/, 'Employee ID must be alphanumeric'),
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[A-Za-z\s'-]+$/, 'First name must contain only letters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[A-Za-z\s'-]+$/, 'Last name must contain only letters'),
  role: z.enum(['admin', 'employee']).default('employee')
});

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(100, 'Password must be less than 100 characters')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

module.exports = { signupSchema, loginSchema, refreshTokenSchema };
