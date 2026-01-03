import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, MessageSquare, Calendar } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { mockLeaveRequests } from '@/data/mockData';
import { LeaveRequest, LeaveStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusColors: Record<LeaveStatus, string> = {
  pending: 'bg-warning/10 text-warning-foreground',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

const leaveTypeColors: Record<string, string> = {
  paid: 'bg-info/10 text-info',
  sick: 'bg-destructive/10 text-destructive',
  unpaid: 'bg-muted text-muted-foreground',
};

const Approvals: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Only admins can access this page
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const pendingRequests = leaveRequests.filter(r => r.status === 'pending');
  const processedRequests = leaveRequests.filter(r => r.status !== 'pending');

  const handleAction = (type: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    const updatedRequests = leaveRequests.map(r =>
      r.id === selectedRequest.id
        ? { ...r, status: type === 'approve' ? 'approved' as const : 'rejected' as const, adminComment: comment }
        : r
    );

    setLeaveRequests(updatedRequests);
    setSelectedRequest(null);
    setComment('');
    setActionType(null);

    toast({
      title: type === 'approve' ? 'Leave Approved ✅' : 'Leave Rejected ❌',
      description: `${selectedRequest.userName}'s leave request has been ${type === 'approve' ? 'approved' : 'rejected'}.`,
    });
  };

  const openActionDialog = (request: LeaveRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(type);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Leave Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and manage employee leave requests</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3 animate-slide-up">
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {leaveRequests.filter(r => r.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {leaveRequests.filter(r => r.status === 'rejected').length}
                </p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Pending Requests</h3>
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request, index) => (
                <div
                  key={request.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                      {request.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{request.userName}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                          leaveTypeColors[request.type]
                        )}>
                          {request.type} leave
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {request.startDate} to {request.endDate}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{request.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full lg:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 lg:flex-none text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => openActionDialog(request, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      className="flex-1 lg:flex-none"
                      onClick={() => openActionDialog(request, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <p className="text-muted-foreground">All caught up! No pending requests.</p>
            </div>
          )}
        </div>

        {/* Processed Requests */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Decisions</h3>
          <div className="space-y-3">
            {processedRequests.slice(0, 5).map((request, index) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-xl bg-muted/30 p-4 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div>
                  <p className="font-medium text-foreground">{request.userName}</p>
                  <p className="text-sm text-muted-foreground">
                    {request.type} leave • {request.startDate} to {request.endDate}
                  </p>
                </div>
                <span className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
                  statusColors[request.status]
                )}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Dialog */}
        <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => { setSelectedRequest(null); setActionType(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="font-medium">{selectedRequest?.userName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest?.type} leave: {selectedRequest?.startDate} to {selectedRequest?.endDate}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Add a comment (optional)
                </label>
                <Textarea
                  placeholder="Add a note for the employee..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setSelectedRequest(null); setActionType(null); }}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'approve' ? 'success' : 'destructive'}
                  className="flex-1"
                  onClick={() => handleAction(actionType!)}
                >
                  {actionType === 'approve' ? 'Approve' : 'Reject'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Approvals;
