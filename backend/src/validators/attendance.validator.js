const { z } = require('zod');

const checkInSchema = z.object({
  notes: z.string().max(500).optional()
});

const checkOutSchema = z.object({
  notes: z.string().max(500).optional()
});

const attendanceQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  userId: z.string().uuid('Invalid user ID').optional(),
  status: z.enum(['present', 'absent', 'half-day', 'late', 'weekend', 'holiday']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'half-day', 'late', 'weekend', 'holiday']),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  notes: z.string().max(500).optional()
});

module.exports = { checkInSchema, checkOutSchema, attendanceQuerySchema, updateAttendanceSchema };
