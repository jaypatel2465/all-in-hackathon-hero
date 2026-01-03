import { User, AttendanceRecord, LeaveRequest, PayrollRecord, DashboardStats } from '@/types';

export const mockEmployees: User[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    email: 'admin@dayflow.com',
    role: 'admin',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '+1 234 567 8900',
    address: '123 Corporate Ave, New York, NY 10001',
    department: 'Human Resources',
    position: 'HR Manager',
    dateOfJoining: '2022-01-15',
    salary: 85000,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    email: 'john.smith@dayflow.com',
    role: 'employee',
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1 234 567 8901',
    address: '456 Worker St, New York, NY 10002',
    department: 'Engineering',
    position: 'Software Developer',
    dateOfJoining: '2023-03-20',
    salary: 72000,
  },
  {
    id: '3',
    employeeId: 'EMP003',
    email: 'emily.chen@dayflow.com',
    role: 'employee',
    firstName: 'Emily',
    lastName: 'Chen',
    phone: '+1 234 567 8902',
    address: '789 Tech Blvd, New York, NY 10003',
    department: 'Design',
    position: 'UI/UX Designer',
    dateOfJoining: '2023-06-10',
    salary: 68000,
  },
  {
    id: '4',
    employeeId: 'EMP004',
    email: 'michael.brown@dayflow.com',
    role: 'employee',
    firstName: 'Michael',
    lastName: 'Brown',
    phone: '+1 234 567 8903',
    address: '321 Finance Row, New York, NY 10004',
    department: 'Finance',
    position: 'Financial Analyst',
    dateOfJoining: '2022-09-01',
    salary: 75000,
  },
  {
    id: '5',
    employeeId: 'EMP005',
    email: 'jessica.wilson@dayflow.com',
    role: 'employee',
    firstName: 'Jessica',
    lastName: 'Wilson',
    phone: '+1 234 567 8904',
    address: '654 Marketing Lane, New York, NY 10005',
    department: 'Marketing',
    position: 'Marketing Manager',
    dateOfJoining: '2023-01-05',
    salary: 70000,
  },
];

const generateAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  mockEmployees.forEach(employee => {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        records.push({
          id: `${employee.id}-${date.toISOString().split('T')[0]}`,
          userId: employee.id,
          date: date.toISOString().split('T')[0],
          status: 'weekend',
        });
        continue;
      }

      const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'present', 'late', 'half-day', 'absent'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const checkIn = randomStatus !== 'absent' ? `09:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}` : undefined;
      const checkOut = randomStatus !== 'absent' && randomStatus !== 'half-day' ? `18:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}` : 
                       randomStatus === 'half-day' ? `13:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}` : undefined;
      
      records.push({
        id: `${employee.id}-${date.toISOString().split('T')[0]}`,
        userId: employee.id,
        date: date.toISOString().split('T')[0],
        checkIn,
        checkOut,
        status: randomStatus,
        workHours: checkIn && checkOut ? Math.floor(Math.random() * 4 + 5) : 0,
      });
    }
  });
  
  return records;
};

export const mockAttendance: AttendanceRecord[] = generateAttendanceRecords();

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    userId: '2',
    userName: 'John Smith',
    type: 'paid',
    startDate: '2026-01-10',
    endDate: '2026-01-12',
    reason: 'Family vacation planned for the new year.',
    status: 'pending',
    createdAt: '2026-01-02',
  },
  {
    id: '2',
    userId: '3',
    userName: 'Emily Chen',
    type: 'sick',
    startDate: '2026-01-05',
    endDate: '2026-01-06',
    reason: 'Not feeling well, need to rest.',
    status: 'approved',
    adminComment: 'Get well soon!',
    createdAt: '2026-01-04',
  },
  {
    id: '3',
    userId: '4',
    userName: 'Michael Brown',
    type: 'unpaid',
    startDate: '2026-01-20',
    endDate: '2026-01-25',
    reason: 'Personal matters to attend to.',
    status: 'pending',
    createdAt: '2026-01-01',
  },
  {
    id: '4',
    userId: '5',
    userName: 'Jessica Wilson',
    type: 'paid',
    startDate: '2025-12-28',
    endDate: '2025-12-30',
    reason: 'Year-end holidays.',
    status: 'approved',
    adminComment: 'Approved. Enjoy your holidays!',
    createdAt: '2025-12-20',
  },
];

export const mockPayroll: PayrollRecord[] = mockEmployees.map(emp => ({
  id: `payroll-${emp.id}`,
  userId: emp.id,
  month: 'January',
  year: 2026,
  basicSalary: emp.salary / 12,
  allowances: Math.floor(emp.salary / 12 * 0.15),
  deductions: Math.floor(emp.salary / 12 * 0.1),
  netSalary: Math.floor(emp.salary / 12 * 1.05),
  status: 'pending',
}));

export const mockDashboardStats: DashboardStats = {
  totalEmployees: mockEmployees.length,
  presentToday: 4,
  pendingLeaves: 2,
  totalDepartments: 5,
};
