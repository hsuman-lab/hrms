'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Check, X, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { leaveService } from '@/services/leave.service';
import { LeaveRequest } from '@/types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: () => leaveService.getPendingApprovals(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: 'APPROVED' | 'REJECTED'; remarks?: string }) =>
      leaveService.approve(id, status, remarks),
    onSuccess: (_, vars) => {
      toast.success(`Leave ${vars.status.toLowerCase()} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      setSelected(null);
      setRemarks('');
      setActionType(null);
    },
    onError: () => toast.error('Failed to process leave request'),
  });

  const handleAction = (req: LeaveRequest, action: 'APPROVED' | 'REJECTED') => {
    setSelected(req);
    setActionType(action);
    setRemarks('');
  };

  const confirmAction = () => {
    if (!selected || !actionType) return;
    mutation.mutate({ id: selected.id, status: actionType, remarks });
  };

  return (
    <DashboardLayout title="Leave Approvals" subtitle="Review and approve team leave requests">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckSquare className="w-4 h-4 text-primary-600" />
            <span>{(requests ?? []).length} pending request{(requests ?? []).length !== 1 ? 's' : ''}</span>
          </div>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>Refresh</Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        )}

        {isError && (
          <Card className="text-center py-16 border-red-200">
            <p className="text-red-500 font-medium">Failed to load approvals</p>
            <p className="text-sm text-gray-400 mt-1">Check that you are logged in with the correct role.</p>
            <Button size="sm" variant="secondary" className="mt-4" onClick={() => refetch()}>Try Again</Button>
          </Card>
        )}

        {!isLoading && !isError && (requests ?? []).length === 0 && (
          <Card className="text-center py-16">
            <CheckSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">All caught up!</p>
            <p className="text-sm text-gray-400">No pending leave requests from your team.</p>
          </Card>
        )}

        {(requests ?? []).map((req) => (
          <Card key={req.id} className="hover:shadow-card-hover transition-shadow">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-primary-700 font-semibold text-sm">
                    {req.employee?.first_name?.[0]}{req.employee?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {req.employee?.first_name} {req.employee?.last_name}
                    <span className="ml-2 text-xs text-gray-400 font-normal">#{req.employee?.employee_code}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{req.employee?.department?.department_name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                    <span className="font-medium text-primary-700">{req.leave_type?.leave_name}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">
                      {format(parseISO(req.start_date), 'MMM d')} – {format(parseISO(req.end_date), 'MMM d, yyyy')}
                    </span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">{req.total_days} day{(req.total_days ?? 0) > 1 ? 's' : ''}</span>
                    {req.leave_type?.is_paid ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
                    ) : (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Unpaid</span>
                    )}
                  </div>
                  {req.reason && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {req.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Applied {format(new Date(req.applied_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-green-700 bg-green-50 hover:bg-green-100"
                  leftIcon={Check}
                  onClick={() => handleAction(req, 'APPROVED')}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-red-600 bg-red-50 hover:bg-red-100"
                  leftIcon={X}
                  onClick={() => handleAction(req, 'REJECTED')}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Confirm Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => { setSelected(null); setRemarks(''); setActionType(null); }}
        title={`Confirm ${actionType === 'APPROVED' ? 'Approval' : 'Rejection'}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to <strong>{actionType?.toLowerCase()}</strong> the leave request from{' '}
            <strong>{selected?.employee?.first_name} {selected?.employee?.last_name}</strong> for{' '}
            <strong>{selected?.total_days} day{(selected?.total_days ?? 0) > 1 ? 's' : ''}</strong>.
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add a note for the employee..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button
              className={`flex-1 ${actionType === 'APPROVED' ? '' : 'bg-red-500 hover:bg-red-600'}`}
              onClick={confirmAction}
              isLoading={mutation.isPending}
            >
              {actionType === 'APPROVED' ? 'Approve' : 'Reject'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setSelected(null); setRemarks(''); setActionType(null); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
