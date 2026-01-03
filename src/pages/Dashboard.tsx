import React from 'react';
import { Users, UserCheck, Calendar, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { mockDashboardStats, mockLeaveRequests, mockEmployees } from '@/data/mockData';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const pendingLeaves = mockLeaveRequests.filter(l => l.status === 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin 
              ? "Here's what's happening with your team today." 
              : "Here's your work summary for today."
            }
          </p>
        </div>

        {/* Stats Grid */}
        {isAdmin ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Employees"
              value={mockDashboardStats.totalEmployees}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              delay={0}
            />
            <StatCard
              title="Present Today"
              value={mockDashboardStats.presentToday}
              icon={UserCheck}
              trend={{ value: 5, isPositive: true }}
              delay={50}
            />
            <StatCard
              title="Pending Leaves"
              value={pendingLeaves.length}
              icon={Calendar}
              delay={100}
            />
            <StatCard
              title="Departments"
              value={mockDashboardStats.totalDepartments}
              icon={Building}
              delay={150}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Days Present (This Month)"
              value={18}
              icon={UserCheck}
              trend={{ value: 95, isPositive: true }}
              delay={0}
            />
            <StatCard
              title="Leave Balance"
              value="12 days"
              icon={Calendar}
              delay={50}
            />
            <StatCard
              title="Pending Requests"
              value={mockLeaveRequests.filter(l => l.userId === user?.id && l.status === 'pending').length}
              icon={Calendar}
              delay={100}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          <QuickActions />
          <RecentActivity />
        </div>

        {/* Admin-specific sections */}
        {isAdmin && (
          <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Pending Leave Approvals</h3>
            {pendingLeaves.length > 0 ? (
              <div className="space-y-3">
                {pendingLeaves.slice(0, 3).map((leave) => (
                  <div 
                    key={leave.id} 
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{leave.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave • {leave.startDate} to {leave.endDate}
                      </p>
                    </div>
                    <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-medium text-warning-foreground">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending leave requests.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
