'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { attendanceService } from '@/services/attendance.service';
import { Attendance } from '@/types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const queryClient = useQueryClient();

  const { data: today, isLoading: loadingToday } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: () => attendanceService.getToday(),
    refetchInterval: 60000,
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['attendance-history'],
    queryFn: () => attendanceService.getHistory({ limit: 30 }),
  });

  const clockInMutation = useMutation({
    mutationFn: () => attendanceService.clockIn(),
    onSuccess: () => {
      toast.success('Clocked in successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err?.response?.data?.error || 'Failed to clock in');
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: () => attendanceService.clockOut(),
    onSuccess: () => {
      toast.success('Clocked out successfully!');
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err?.response?.data?.error || 'Failed to clock out');
    },
  });

  const records = historyData?.records ?? [];
  const presentDays = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const lateDays = records.filter((r) => r.status === 'LATE').length;
  const absentDays = records.filter((r) => r.status === 'ABSENT').length;

  const columns = [
    {
      key: 'attendance_date',
      header: 'Date',
      render: (row: Attendance) => (
        <span className="font-medium">{format(parseISO(row.attendance_date), 'EEE, MMM d yyyy')}</span>
      ),
    },
    {
      key: 'clock_in',
      header: 'Clock In',
      render: (row: Attendance) =>
        row.clock_in ? <span className="text-green-600">{format(new Date(row.clock_in), 'h:mm a')}</span> : <span className="text-gray-300">—</span>,
    },
    {
      key: 'clock_out',
      header: 'Clock Out',
      render: (row: Attendance) =>
        row.clock_out ? <span className="text-primary-600">{format(new Date(row.clock_out), 'h:mm a')}</span> : <span className="text-gray-300">—</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (row: Attendance) => {
        if (!row.clock_in || !row.clock_out) return <span className="text-gray-300">—</span>;
        const diff = (new Date(row.clock_out).getTime() - new Date(row.clock_in).getTime()) / 3600000;
        return <span>{diff.toFixed(1)}h</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Attendance) => row.status ? <StatusBadge status={row.status} /> : null,
    },
  ];

  return (
    <DashboardLayout title="Attendance" subtitle="Track your daily attendance">
      <div className="space-y-6">
        {/* Clock In/Out Panel */}
        <Card className="bg-gradient-to-r from-primary-600 to-teal-600 text-white border-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-primary-100 text-sm">Today — {format(new Date(), 'EEEE, MMMM d yyyy')}</p>
              <div className="flex items-center gap-6 mt-2">
                {today?.clock_in && (
                  <div>
                    <p className="text-xs text-primary-200">Clock In</p>
                    <p className="text-xl font-bold">{format(new Date(today.clock_in), 'h:mm a')}</p>
                  </div>
                )}
                {today?.clock_out && (
                  <div>
                    <p className="text-xs text-primary-200">Clock Out</p>
                    <p className="text-xl font-bold">{format(new Date(today.clock_out), 'h:mm a')}</p>
                  </div>
                )}
                {!today?.clock_in && <p className="text-lg font-medium text-primary-200">No attendance recorded yet</p>}
              </div>
              {today?.status && <div className="mt-2"><StatusBadge status={today.status} /></div>}
            </div>
            <div className="flex gap-3">
              {!today?.clock_in && (
                <Button
                  onClick={() => clockInMutation.mutate()}
                  isLoading={clockInMutation.isPending}
                  className="bg-white text-primary-700 hover:bg-primary-50 border-0 shadow-md"
                  leftIcon={LogIn}
                >
                  Clock In
                </Button>
              )}
              {today?.clock_in && !today?.clock_out && (
                <Button
                  onClick={() => clockOutMutation.mutate()}
                  isLoading={clockOutMutation.isPending}
                  className="bg-white text-primary-700 hover:bg-primary-50 border-0 shadow-md"
                  leftIcon={LogOut}
                >
                  Clock Out
                </Button>
              )}
              {today?.clock_out && (
                <div className="bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium">
                  Work day complete ✓
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Present Days" value={presentDays} subtitle="This month" icon={Clock} color="green" />
          <StatCard title="Late Arrivals" value={lateDays} subtitle="This month" icon={Clock} color="orange" />
          <StatCard title="Absent Days" value={absentDays} subtitle="This month" icon={Calendar} color="red" />
          <StatCard title="Total Records" value={records.length} subtitle="Last 30 days" icon={Calendar} color="primary" />
        </div>

        {/* Attendance History */}
        <Card padding="sm">
          <div className="px-2 py-3 mb-4">
            <h3 className="font-semibold text-gray-800">Attendance History</h3>
            <p className="text-sm text-gray-500">Last 30 records</p>
          </div>
          <Table
            columns={columns as Parameters<typeof Table>[0]['columns']}
            data={records as unknown as Record<string, unknown>[]}
            emptyMessage="No attendance records found"
            isLoading={loadingHistory}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
