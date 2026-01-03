import React, { useState } from 'react';
import { Search, Users, Mail, Phone, Building } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { mockEmployees } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Employees: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Only admins can access this page
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredEmployees = mockEmployees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const departments = [...new Set(mockEmployees.map(e => e.department))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all employee records
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="font-medium">{mockEmployees.length} employees</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-slide-up">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Department Summary */}
        <div className="flex flex-wrap gap-2 animate-slide-up" style={{ animationDelay: '50ms' }}>
          {departments.map((dept) => (
            <span
              key={dept}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
            >
              <Building className="h-3 w-3" />
              {dept}
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-primary">
                {mockEmployees.filter(e => e.department === dept).length}
              </span>
            </span>
          ))}
        </div>

        {/* Employee Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee, index) => (
            <div
              key={employee.id}
              className="group rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-lg font-bold text-primary-foreground shadow-primary transition-transform duration-300 group-hover:scale-110">
                  {employee.firstName[0]}{employee.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {employee.firstName} {employee.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                  <span className={cn(
                    "inline-flex mt-2 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    employee.role === 'admin' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {employee.role}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{employee.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No employees found matching your search.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Employees;
