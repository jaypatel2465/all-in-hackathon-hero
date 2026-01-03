import React, { useState } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { mockLeaveRequests } from '@/data/mockData';
import { LeaveType, LeaveStatus, LeaveRequest } from '@/types';
import { cn } from '@/lib/utils';

const leaveTypeLabels: Record<LeaveType, string> = {
  paid: 'Paid Leave',
  sick: 'Sick Leave',
  unpaid: 'Unpaid Leave',
};

const statusColors: Record<LeaveStatus, string> = {
  pending: 'bg-warning/10 text-warning-foreground',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

const statusIcons: Record<LeaveStatus, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

const Leave: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [formData, setFormData] = useState({
    type: 'paid' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const userLeaves = leaveRequests.filter(l => l.userId === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    const newLeave: LeaveRequest = {
      id: String(leaveRequests.length + 1),
      userId: user?.id || '',
      userName: `${user?.firstName} ${user?.lastName}`,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLeaveRequests([newLeave, ...leaveRequests]);
    setIsDialogOpen(false);
    setFormData({ type: 'paid', startDate: '', endDate: '', reason: '' });
    
    toast({
      title: "Leave Request Submitted! 📨",
      description: "Your leave request has been sent for approval.",
    });
  };

  // Leave balance (mock data)
  const leaveBalance = {
    paid: 12,
    sick: 8,
    unpaid: 'Unlimited',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
            <p className="text-muted-foreground mt-1">Apply for leave and track your requests</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="h-4 w-4 mr-2" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: LeaveType) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Please provide a reason for your leave..."
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" className="flex-1">
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leave Balance */}
        <div className="grid gap-4 sm:grid-cols-3 animate-slide-up">
          {Object.entries(leaveBalance).map(([type, balance], index) => (
            <div
              key={type}
              className="rounded-2xl bg-card p-5 shadow-card"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground capitalize">{type} Leave</p>
                  <p className="text-xl font-bold text-foreground">
                    {typeof balance === 'number' ? `${balance} days` : balance}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Leave Requests */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '150ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">My Leave Requests</h3>
          
          {userLeaves.length > 0 ? (
            <div className="space-y-4">
              {userLeaves.map((leave, index) => {
                const StatusIcon = statusIcons[leave.status];
                return (
                  <div
                    key={leave.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        statusColors[leave.status]
                      )}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {leaveTypeLabels[leave.type]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {leave.startDate} to {leave.endDate}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">{leave.reason}</p>
                        {leave.adminComment && (
                          <p className="text-sm text-accent-foreground mt-2 italic">
                            "{leave.adminComment}"
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
                      statusColors[leave.status]
                    )}>
                      {leave.status}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leave requests yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Apply for Leave" to create one.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leave;
