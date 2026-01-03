import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: 'primary' | 'success' | 'info' | 'warning';
}

const actions: QuickAction[] = [
  {
    label: 'Check In',
    description: 'Start your work day',
    href: '/attendance',
    icon: Clock,
    color: 'primary',
  },
  {
    label: 'Apply Leave',
    description: 'Request time off',
    href: '/leave',
    icon: Calendar,
    color: 'success',
  },
  {
    label: 'View Profile',
    description: 'See your details',
    href: '/profile',
    icon: User,
    color: 'info',
  },
  {
    label: 'Payslip',
    description: 'View salary details',
    href: '/payroll',
    icon: FileText,
    color: 'warning',
  },
];

const colorClasses = {
  primary: 'bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground',
  success: 'bg-success/10 text-success hover:bg-success hover:text-success-foreground',
  info: 'bg-info/10 text-info hover:bg-info hover:text-info-foreground',
  warning: 'bg-warning/10 text-warning-foreground hover:bg-warning hover:text-warning-foreground',
};

export const QuickActions: React.FC = () => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className={cn(
              "group flex flex-col items-center rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
              colorClasses[action.color]
            )}
          >
            <action.icon className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">{action.label}</span>
            <span className="text-xs opacity-70">{action.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
