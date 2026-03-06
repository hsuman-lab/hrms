'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Plus } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { leaveService } from '@/services/leave.service';
import { LeaveRequest } from '@/types';
import { format, parseISO } from 'date-fns';

export default function LeavePage() {
  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: () => leaveService.getMyLeaves(),
  });

  const { data: balances } = useQuery({
    queryKey: ['leave-balance'],
    queryFn: () => leaveService.getBalance(),
  });

  const columns = [
    { key: 'leave_type', header: 'Type', render: (r: LeaveRequest) => <span className="font-medium">{r.leave_type?.leave_name}</span> },
    { key: 'start_date', header: 'Start', render: (r: LeaveRequest) => format(parseISO(r.start_date), 'MMM d, yyyy') },
    { key: 'end_date', header: 'End', render: (r: LeaveRequest) => format(parseISO(r.end_date), 'MMM d, yyyy') },
    { key: 'total_days', header: 'Days', render: (r: LeaveRequest) => `${r.total_days} day${(r.total_days ?? 0) > 1 ? 's' : ''}` },
    { key: 'reason', header: 'Reason', render: (r: LeaveRequest) => <span className="text-gray-500 truncate max-w-xs block">{r.reason || '—'}</span> },
    { key: 'status', header: 'Status', render: (r: LeaveRequest) => <StatusBadge status={r.status} /> },
    {
      key: 'approvals',
      header: 'Remarks',
      render: (r: LeaveRequest) => {
        const approval = r.approvals?.[0];
        return approval?.remarks ? <span className="text-xs text-gray-500">{approval.remarks}</span> : <span className="text-gray-300">—</span>;
      },
    },
  ];

  return (
    <DashboardLayout title="My Leaves" subtitle="View and manage your leave requests">
      <div className="space-y-6">
        {/* Leave Balances */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(balances ?? []).map((lb) => {
            const total = (lb.remaining_days ?? 0) + lb.used_days;
            const pct = total > 0 ? ((lb.remaining_days ?? 0) / total) * 100 : 0;
            return (
              <Card key={lb.id} padding="sm">
                <p className="text-xs font-medium text-gray-500 mb-1">{lb.leave_type?.leave_name}</p>
                <p className="text-2xl font-bold text-primary-700">{lb.remaining_days ?? 0}</p>
                <p className="text-xs text-gray-400">of {total} days left</p>
                <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Link href="/leave/apply">
            <Button leftIcon={Plus}>Apply for Leave</Button>
          </Link>
        </div>

        {/* Leave Requests Table */}
        <Card padding="sm">
          <div className="px-2 py-3 mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-600" />
              Leave History
            </h3>
          </div>
          <Table
            columns={columns as Parameters<typeof Table>[0]['columns']}
            data={(leaveRequests ?? []) as unknown as Record<string, unknown>[]}
            emptyMessage="No leave requests yet. Apply for your first leave."
            isLoading={isLoading}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
