const { z } = require('zod');

const applyLeaveSchema = z.object({
  type: z.enum(['paid', 'sick', 'unpaid'], {
    errorMap: () => ({ message: 'Leave type must be paid, sick, or unpaid' })
  }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  reason: z.string()
    .min(10, 'Reason must be at least 10 characters')
    .max(1000, 'Reason must be less than 1000 characters')
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

const updateLeaveStatusSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'Status must be approved or rejected' })
  }),
  adminComment: z.string()
    .max(500, 'Comment must be less than 500 characters')
    .optional()
});

const leaveQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  type: z.enum(['paid', 'sick', 'unpaid']).optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

module.exports = { applyLeaveSchema, updateLeaveStatusSchema, leaveQuerySchema };
