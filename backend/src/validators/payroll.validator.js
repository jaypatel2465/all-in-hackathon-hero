const { z } = require('zod');

const createPayrollSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  basicSalary: z.number().positive('Basic salary must be positive'),
  allowances: z.number().min(0, 'Allowances cannot be negative').default(0),
  deductions: z.number().min(0, 'Deductions cannot be negative').default(0),
  notes: z.string().max(500).optional()
});

const updatePayrollSchema = z.object({
  basicSalary: z.number().positive('Basic salary must be positive').optional(),
  allowances: z.number().min(0, 'Allowances cannot be negative').optional(),
  deductions: z.number().min(0, 'Deductions cannot be negative').optional(),
  status: z.enum(['pending', 'paid']).optional(),
  notes: z.string().max(500).optional()
});

const payrollQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format').optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  status: z.enum(['pending', 'paid']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

module.exports = { createPayrollSchema, updatePayrollSchema, payrollQuerySchema };
