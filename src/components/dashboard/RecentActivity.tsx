import React from 'react';
import { Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'check-in' | 'check-out' | 'leave-approved' | 'leave-rejected' | 'leave-applied';
  description: string;
  time: string;
}

const mockActivities: Activity[] = [
  { id: '1', type: 'check-in', description: 'Checked in for work', time: '09:05 AM' },
  { id: '2', type: 'leave-approved', description: 'Vacation leave approved', time: 'Yesterday' },
  { id: '3', type: 'check-out', description: 'Checked out', time: 'Yesterday' },
  { id: '4', type: 'leave-applied', description: 'Applied for sick leave', time: '2 days ago' },
];

const activityIcons = {
  'check-in': Clock,
  'check-out': Clock,
  'leave-approved': CheckCircle,
  'leave-rejected': XCircle,
  'leave-applied': Calendar,
};

const activityColors = {
  'check-in': 'bg-success/10 text-success',
  'check-out': 'bg-muted text-muted-foreground',
  'leave-approved': 'bg-success/10 text-success',
  'leave-rejected': 'bg-destructive/10 text-destructive',
  'leave-applied': 'bg-info/10 text-info',
};

export const RecentActivity: React.FC = () => {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '300ms' }}>
      <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h3>
      <div className="space-y-4">
        {mockActivities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              className="flex items-center gap-4 animate-fade-in"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                activityColors[activity.type]
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
