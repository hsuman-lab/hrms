'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Check, X, MessageSquare, Receipt, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { leaveService } from '@/services/leave.service';
import { reimbursementService } from '@/services/reimbursement.service';
import { LeaveRequest, Reimbursement, ReimbursementCategory } from '@/types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

type Tab = 'leave' | 'reimbursement';

const CATEGORIES: Record<ReimbursementCategory, { label: string; icon: string }> = {
  TRAVEL:        { label: 'Travel',        icon: '✈️' },
  FOOD:          { label: 'Food & Meals',  icon: '🍽️' },
  MEDICAL:       { label: 'Medical',       icon: '🏥' },
  ACCOMMODATION: { label: 'Accommodation', icon: '🏨' },
  OTHER:         { label: 'Other',         icon: '📎' },
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// ─── Leave Approvals ─────────────────────────────────────────────────────────
function LeaveApprovals() {
  const queryClient = useQueryClient();
  const [selected, setSelected]   = useState<LeaveRequest | null>(null);
  const [remarks, setRemarks]     = useState('');
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const { data: requests = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: leaveService.getPendingApprovals,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: 'APPROVED' | 'REJECTED'; remarks?: string }) =>
      leaveService.approve(id, status, remarks),
    onSuccess: (_, vars) => {
      toast.success(`Leave ${vars.status.toLowerCase()} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      setSelected(null); setRemarks(''); setActionType(null);
    },
    onError: () => toast.error('Failed to process leave request'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CheckSquare className="w-4 h-4 text-primary-600" />
          <span>{requests.length} pending request{requests.length !== 1 ? 's' : ''}</span>
        </div>
        <Button size="sm" variant="secondary" onClick={() => refetch()}>Refresh</Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {isError && (
        <Card className="text-center py-16 border-red-200">
          <p className="text-red-500 font-medium">Failed to load approvals</p>
          <Button size="sm" variant="secondary" className="mt-4" onClick={() => refetch()}>Try Again</Button>
        </Card>
      )}

      {!isLoading && !isError && requests.length === 0 && (
        <Card className="text-center py-16">
          <CheckSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">All caught up!</p>
          <p className="text-sm text-gray-400">No pending leave requests from your team.</p>
        </Card>
      )}

      {requests.map((req) => (
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
                  {req.leave_type?.is_paid
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid</span>
                    : <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Unpaid</span>}
                </div>
                {req.reason && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />{req.reason}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Applied {format(new Date(req.applied_at), 'MMM d, yyyy h:mm a')}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="secondary" className="text-green-700 bg-green-50 hover:bg-green-100"
                leftIcon={Check} onClick={() => { setSelected(req); setActionType('APPROVED'); setRemarks(''); }}>
                Approve
              </Button>
              <Button size="sm" variant="secondary" className="text-red-600 bg-red-50 hover:bg-red-100"
                leftIcon={X} onClick={() => { setSelected(req); setActionType('REJECTED'); setRemarks(''); }}>
                Reject
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setRemarks(''); setActionType(null); }}
        title={`Confirm ${actionType === 'APPROVED' ? 'Approval' : 'Rejection'}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to <strong>{actionType?.toLowerCase()}</strong> the leave request from{' '}
            <strong>{selected?.employee?.first_name} {selected?.employee?.last_name}</strong> for{' '}
            <strong>{selected?.total_days} day{(selected?.total_days ?? 0) > 1 ? 's' : ''}</strong>.
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
              placeholder="Add a note for the employee..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <Button className={`flex-1 ${actionType === 'APPROVED' ? '' : 'bg-red-500 hover:bg-red-600'}`}
              onClick={() => selected && actionType && mutation.mutate({ id: selected.id, status: actionType, remarks })}
              isLoading={mutation.isPending}>
              {actionType === 'APPROVED' ? 'Approve' : 'Reject'}
            </Button>
            <Button variant="secondary" onClick={() => { setSelected(null); setRemarks(''); setActionType(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Reimbursement Approvals ─────────────────────────────────────────────────
function ReimbursementApprovals() {
  const queryClient = useQueryClient();
  const [selected, setSelected]     = useState<Reimbursement | null>(null);
  const [remarks, setRemarks]       = useState('');
  const [actionType, setActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);

  const { data: claims = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['pending-reimbursements-team'],
    queryFn: reimbursementService.getPendingTeam,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: 'APPROVED' | 'REJECTED'; remarks?: string }) =>
      reimbursementService.action(id, status, remarks),
    onSuccess: (_, vars) => {
      toast.success(`Reimbursement ${vars.status.toLowerCase()} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['pending-reimbursements-team'] });
      setSelected(null); setRemarks(''); setActionType(null);
    },
    onError: (e: { response?: { data?: { error?: string } } }) =>
      toast.error(e?.response?.data?.error || 'Failed to process reimbursement'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Receipt className="w-4 h-4 text-primary-600" />
          <span>{claims.length} pending claim{claims.length !== 1 ? 's' : ''}</span>
        </div>
        <Button size="sm" variant="secondary" onClick={() => refetch()}>Refresh</Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      )}

      {isError && (
        <Card className="text-center py-16 border-red-200">
          <p className="text-red-500 font-medium">Failed to load reimbursement claims</p>
          <Button size="sm" variant="secondary" className="mt-4" onClick={() => refetch()}>Try Again</Button>
        </Card>
      )}

      {!isLoading && !isError && claims.length === 0 && (
        <Card className="text-center py-16">
          <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No pending reimbursement claims</p>
          <p className="text-sm text-gray-400">Your team has no expense claims awaiting approval.</p>
        </Card>
      )}

      {claims.map((claim) => {
        const cat = CATEGORIES[claim.category] ?? CATEGORIES.OTHER;
        return (
          <Card key={claim.id} className="hover:shadow-card-hover transition-shadow">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-primary-700 font-semibold text-sm">
                    {claim.employee?.first_name?.[0]}{claim.employee?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {claim.employee?.first_name} {claim.employee?.last_name}
                    <span className="ml-2 text-xs text-gray-400 font-normal">#{claim.employee?.employee_code}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{claim.employee?.department?.department_name}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="font-medium text-primary-700">{cat.label}</span>
                    <span className="text-gray-400">·</span>
                    <span className="font-bold text-gray-800">{fmt(Number(claim.amount))}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Bill: {format(parseISO(claim.bill_date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{claim.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Applied {format(parseISO(claim.applied_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="secondary" className="text-green-700 bg-green-50 hover:bg-green-100"
                  leftIcon={Check} onClick={() => { setSelected(claim); setActionType('APPROVED'); setRemarks(''); }}>
                  Approve
                </Button>
                <Button size="sm" variant="secondary" className="text-red-600 bg-red-50 hover:bg-red-100"
                  leftIcon={X} onClick={() => { setSelected(claim); setActionType('REJECTED'); setRemarks(''); }}>
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        );
      })}

      <Modal isOpen={!!selected} onClose={() => { setSelected(null); setRemarks(''); setActionType(null); }}
        title={`Confirm ${actionType === 'APPROVED' ? 'Approval' : 'Rejection'}`} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are about to <strong>{actionType?.toLowerCase()}</strong> the reimbursement claim of{' '}
            <strong>{fmt(Number(selected?.amount))}</strong> from{' '}
            <strong>{selected?.employee?.first_name} {selected?.employee?.last_name}</strong>.
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Remarks (Optional)</label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
              placeholder="Add a note for the employee..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <Button className={`flex-1 ${actionType === 'APPROVED' ? '' : 'bg-red-500 hover:bg-red-600'}`}
              onClick={() => selected && actionType && mutation.mutate({ id: selected.id, status: actionType, remarks })}
              isLoading={mutation.isPending}>
              {actionType === 'APPROVED' ? 'Approve' : 'Reject'}
            </Button>
            <Button variant="secondary" onClick={() => { setSelected(null); setRemarks(''); setActionType(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ApprovalsPage() {
  const [tab, setTab] = useState<Tab>('leave');

  const { data: leaveData = [] } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: leaveService.getPendingApprovals,
  });
  const { data: reimData = [] } = useQuery({
    queryKey: ['pending-reimbursements-team'],
    queryFn: reimbursementService.getPendingTeam,
  });

  return (
    <DashboardLayout title="Team Approvals" subtitle="Review and approve team requests">
      <div className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          <button onClick={() => setTab('leave')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'leave' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <CheckSquare className="w-4 h-4" />
            Leave
            {leaveData.length > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {leaveData.length}
              </span>
            )}
          </button>
          <button onClick={() => setTab('reimbursement')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'reimbursement' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <Receipt className="w-4 h-4" />
            Reimbursements
            {reimData.length > 0 && (
              <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {reimData.length}
              </span>
            )}
          </button>
        </div>

        {tab === 'leave'          ? <LeaveApprovals /> : <ReimbursementApprovals />}
      </div>
    </DashboardLayout>
  );
}
