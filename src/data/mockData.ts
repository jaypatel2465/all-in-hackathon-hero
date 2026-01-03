import { User, AttendanceRecord, LeaveRequest, PayrollRecord, DashboardStats } from '@/types';

export const mockEmployees: User[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    email: 'admin@dayflow.com',
    role: 'admin',
    firstName: 'Jay',
    lastName: 'Patel',
    phone: '9727445759',
    address: 'Anand - 388001',
    department: 'Human Resources',
    position: 'HR Manager',
    dateOfJoining: '2022-01-15',
    salary: 85000,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    email: 'devarsh@gmail.com',
    role: 'employee',
    firstName: 'Devarsh',
    lastName: 'Patel',
    phone: '9638569768',
    address: 'Bakrol-388315',
    department: 'Engineering',
    position: 'Software Developer',
    dateOfJoining: '2023-03-20',
    salary: 72000,
  },
  {
    id: '3',
    employeeId: 'EMP003',
    email: 'rudrakacchia2005@gmail.com',
    role: 'employee',
    firstName: 'Rudra',
    lastName: 'Kacchia',
    phone: '6353931131',
    address: 'Vadodra',
    department: 'Design',
    position: 'UI/UX Designer',
    dateOfJoining: '2023-06-10',
    salary: 68000,
  },
  {
    id: '4',
    employeeId: 'EMP004',
    email: 'nand.brown@dayflow.com',
    role: 'employee',
    firstName: 'Nand',
    lastName: 'thakor',
    phone: '98563147536',
    address: 'Anand',
    department: 'Finance',
    position: 'Financial Analyst',
    dateOfJoining: '2022-09-01',
    salary: 75000,
  },
  {
    id: '5',
    employeeId: 'EMP005',
    email: 'renish.wilson@dayflow.com',
    role: 'employee',
    firstName: 'Renish',
    lastName: 'Patel',
    phone: '8542369715',
    address: 'Jamnagar',
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
    userName: 'Devarsh Patel',
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
    userName: 'Rudra Kacchia',
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
    userName: 'Nand Thakkar',
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
    userName: 'Renish Patel',
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
