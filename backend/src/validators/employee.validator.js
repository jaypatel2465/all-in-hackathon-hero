const { z } = require('zod');

const updateProfileSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  phone: z.string()
    .regex(/^[\d\s+()-]+$/, 'Invalid phone number format')
    .max(20, 'Phone must be less than 20 characters')
    .nullable()
    .optional(),
  address: z.string()
    .max(500, 'Address must be less than 500 characters')
    .nullable()
    .optional(),
  avatar: z.string()
    .url('Invalid avatar URL')
    .nullable()
    .optional()
});

const createEmployeeSchema = z.object({
  employeeId: z.string()
    .min(3, 'Employee ID must be at least 3 characters')
    .max(20, 'Employee ID must be less than 20 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'employee']).default('employee'),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  salary: z.number().positive('Salary must be positive').optional(),
  dateOfJoining: z.string().optional()
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

module.exports = { updateProfileSchema, createEmployeeSchema, paginationSchema };
