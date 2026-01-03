require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dayflow_hrms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const employeePassword = await bcrypt.hash('employee123', 12);

    // Create admin user
    const adminResult = await pool.query(
      `INSERT INTO users (employee_id, email, password, status)
       VALUES ('EMP001', 'admin@dayflow.com', $1, 'active')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [adminPassword]
    );

    if (adminResult.rows.length > 0) {
      const adminId = adminResult.rows[0].id;
      
      // Add admin role
      await pool.query(
        `INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin') ON CONFLICT DO NOTHING`,
        [adminId]
      );

      // Add admin profile
      await pool.query(
        `INSERT INTO employee_profiles (user_id, first_name, last_name, phone, address, department, position, date_of_joining, salary)
         VALUES ($1, 'Sarah', 'Johnson', '+1 234 567 8900', '123 Corporate Ave, New York, NY 10001', 'Human Resources', 'HR Manager', '2022-01-15', 85000)
         ON CONFLICT (user_id) DO NOTHING`,
        [adminId]
      );
      console.log('✅ Admin user created');
    }

    // Create employee user
    const employeeResult = await pool.query(
      `INSERT INTO users (employee_id, email, password, status)
       VALUES ('EMP002', 'employee@dayflow.com', $1, 'active')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [employeePassword]
    );

    if (employeeResult.rows.length > 0) {
      const employeeId = employeeResult.rows[0].id;
      
      // Add employee role
      await pool.query(
        `INSERT INTO user_roles (user_id, role) VALUES ($1, 'employee') ON CONFLICT DO NOTHING`,
        [employeeId]
      );

      // Add employee profile
      await pool.query(
        `INSERT INTO employee_profiles (user_id, first_name, last_name, phone, address, department, position, date_of_joining, salary)
         VALUES ($1, 'John', 'Smith', '+1 234 567 8901', '456 Worker St, New York, NY 10002', 'Engineering', 'Software Developer', '2023-03-20', 72000)
         ON CONFLICT (user_id) DO NOTHING`,
        [employeeId]
      );
      console.log('✅ Employee user created');
    }

    // Create more sample employees
    const departments = ['Engineering', 'Marketing', 'Sales', 'Finance', 'Operations'];
    const positions = ['Manager', 'Senior Developer', 'Analyst', 'Coordinator', 'Specialist'];
    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward'];
    const lastNames = ['Williams', 'Brown', 'Davis', 'Miller', 'Wilson'];

    for (let i = 0; i < 5; i++) {
      const empId = `EMP${String(i + 3).padStart(3, '0')}`;
      const email = `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@dayflow.com`;
      const hashedPassword = await bcrypt.hash('password123', 12);

      const userResult = await pool.query(
        `INSERT INTO users (employee_id, email, password, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [empId, email, hashedPassword]
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        await pool.query(
          `INSERT INTO user_roles (user_id, role) VALUES ($1, 'employee') ON CONFLICT DO NOTHING`,
          [userId]
        );

        await pool.query(
          `INSERT INTO employee_profiles (user_id, first_name, last_name, department, position, date_of_joining, salary)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id) DO NOTHING`,
          [userId, firstNames[i], lastNames[i], departments[i], positions[i], '2023-06-01', 60000 + (i * 5000)]
        );
      }
    }
    console.log('✅ Sample employees created');

    // Get all user IDs for attendance and leave data
    const users = await pool.query('SELECT id FROM users');
    
    // Create sample attendance for today
    const today = new Date().toISOString().split('T')[0];
    for (const user of users.rows) {
      await pool.query(
        `INSERT INTO attendance (user_id, date, check_in, status, work_hours)
         VALUES ($1, $2, '09:00:00', 'present', 0)
         ON CONFLICT (user_id, date) DO NOTHING`,
        [user.id, today]
      );
    }
    console.log('✅ Sample attendance created');

    // Create sample leave requests
    const employeeUsers = await pool.query(
      `SELECT u.id, ep.first_name, ep.last_name 
       FROM users u 
       JOIN user_roles ur ON ur.user_id = u.id 
       JOIN employee_profiles ep ON ep.user_id = u.id
       WHERE ur.role = 'employee' LIMIT 3`
    );

    const leaveTypes = ['paid', 'sick', 'unpaid'];
    for (let i = 0; i < employeeUsers.rows.length; i++) {
      const user = employeeUsers.rows[i];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (i + 1) * 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2);

      await pool.query(
        `INSERT INTO leave_requests (user_id, user_name, type, start_date, end_date, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
        [
          user.id,
          `${user.first_name} ${user.last_name}`,
          leaveTypes[i],
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          'Personal reasons'
        ]
      );
    }
    console.log('✅ Sample leave requests created');

    // Create sample payroll records
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear();
    
    const allProfiles = await pool.query(
      'SELECT user_id, salary FROM employee_profiles WHERE salary > 0'
    );

    for (const profile of allProfiles.rows) {
      await pool.query(
        `INSERT INTO payroll (user_id, month, year, basic_salary, allowances, deductions, net_salary, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
         ON CONFLICT (user_id, month) DO NOTHING`,
        [
          profile.user_id,
          currentMonth,
          currentYear,
          profile.salary / 12,
          500,
          200,
          (profile.salary / 12) + 500 - 200
        ]
      );
    }
    console.log('✅ Sample payroll records created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('  Admin: admin@dayflow.com / admin123');
    console.log('  Employee: employee@dayflow.com / employee123');

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
