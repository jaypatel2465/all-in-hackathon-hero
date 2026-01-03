import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockPayroll } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Payroll: React.FC = () => {
  const { user } = useAuth();

  const userPayroll = mockPayroll.find(p => p.userId === user?.id);

  const payrollBreakdown = userPayroll ? [
    { label: 'Basic Salary', amount: userPayroll.basicSalary, type: 'earning' as const },
    { label: 'Allowances', amount: userPayroll.allowances, type: 'earning' as const },
    { label: 'Deductions', amount: userPayroll.deductions, type: 'deduction' as const },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground mt-1">View your salary and compensation details</p>
        </div>

        {/* Net Salary Card */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up overflow-hidden relative">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-primary">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Salary</p>
                <p className="text-sm text-muted-foreground">
                  {userPayroll?.month} {userPayroll?.year}
                </p>
              </div>
            </div>
            <p className="text-4xl font-bold text-foreground">
              ${userPayroll?.netSalary.toLocaleString()}
            </p>
            <span className={cn(
              "inline-flex items-center mt-3 rounded-full px-3 py-1 text-xs font-medium capitalize",
              userPayroll?.status === 'paid' 
                ? 'bg-success/10 text-success' 
                : 'bg-warning/10 text-warning-foreground'
            )}>
              {userPayroll?.status}
            </span>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Salary Breakdown</h3>
          <div className="space-y-4">
            {payrollBreakdown.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    item.type === 'earning' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  )}>
                    {item.type === 'earning' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <span className={cn(
                  "font-semibold",
                  item.type === 'earning' ? 'text-success' : 'text-destructive'
                )}>
                  {item.type === 'earning' ? '+' : '-'}${item.amount.toLocaleString()}
                </span>
              </div>
            ))}
            
            {/* Total */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-accent border-2 border-primary/20">
              <span className="font-semibold text-foreground">Net Salary</span>
              <span className="text-xl font-bold text-primary">
                ${userPayroll?.netSalary.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>
          <div className="space-y-3">
            {['December 2025', 'November 2025', 'October 2025'].map((month, index) => (
              <div
                key={month}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{month}</p>
                    <p className="text-sm text-muted-foreground">Salary Payment</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    ${userPayroll?.netSalary.toLocaleString()}
                  </p>
                  <span className="text-xs text-success font-medium">Paid</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payroll;
