# Dayflow HRMS - Backend Documentation

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   ```

4. **Create database and run schema:**
   ```bash
   psql -U postgres -c "CREATE DATABASE dayflow_hrms;"
   psql -U postgres -d dayflow_hrms -f src/database/schema.sql
   ```

5. **Seed sample data:**
   ```bash
   npm run seed
   ```

6. **Start server:**
   ```bash
   npm run dev
   ```

### Demo Credentials
- **Admin:** admin@dayflow.com / admin123
- **Employee:** employee@dayflow.com / employee123

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Employees (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List all employees (paginated) |
| GET | `/api/employees/:id` | Get employee details |
| PUT | `/api/employees/:id` | Update employee |
| GET | `/api/employees/departments` | List departments |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get own profile |
| PUT | `/api/users/profile` | Update own profile |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/check-in` | Check in |
| POST | `/api/attendance/check-out` | Check out |
| GET | `/api/attendance/today` | Get today's attendance |
| GET | `/api/attendance/history` | Get attendance history |
| GET | `/api/attendance/weekly-summary` | Get weekly summary |

### Leave
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leave` | Apply for leave |
| GET | `/api/leave` | Get leave requests |
| GET | `/api/leave/balance` | Get leave balance |
| PUT | `/api/leave/:id/status` | Approve/reject (admin) |
| DELETE | `/api/leave/:id` | Cancel leave request |

### Payroll
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payroll` | Get payroll records |
| GET | `/api/payroll/summary` | Get payroll summary |
| POST | `/api/payroll` | Create payroll (admin) |
| POST | `/api/payroll/generate` | Generate monthly payroll (admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/dashboard/activity` | Get recent activity (admin) |

---

## Frontend Integration

Add to your `.env` file in the frontend:
```
VITE_API_URL=http://localhost:5000/api
```

The frontend service layer (`src/services/`) is ready to connect to the backend APIs.

---

## Database Schema

See `backend/src/database/schema.sql` for complete schema with:
- Users & Roles (separate tables for security)
- Employee Profiles
- Attendance
- Leave Requests
- Payroll
- Refresh Tokens
- Proper indexes and triggers
