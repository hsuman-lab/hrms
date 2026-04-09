'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogIn, LogOut, Calendar, CheckCircle2, Timer, Sunrise, Sunset } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { attendanceService } from '@/services/attendance.service';
import { Attendance } from '@/types';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import toast from 'react-hot-toast';

// ─── Live clock hook ──────────────────────────────────────────────────────────
function useLiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ─── Duration formatter ───────────────────────────────────────────────────────
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const now = useLiveClock();

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
      toast.success('Clocked out! Great work today.');
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err?.response?.data?.error || 'Failed to clock out');
    },
  });

  // Derived state
  const isCheckedIn  = !!today?.clock_in && !today?.clock_out;
  const isDayDone    = !!today?.clock_in && !!today?.clock_out;
  const notStarted   = !today?.clock_in;

  // Live elapsed duration since clock-in
  const elapsedSeconds = isCheckedIn && today?.clock_in
    ? differenceInSeconds(now, new Date(today.clock_in))
    : isDayDone && today?.clock_in && today?.clock_out
    ? differenceInSeconds(new Date(today.clock_out), new Date(today.clock_in))
    : 0;

  const records = historyData?.records ?? [];
  const presentDays = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const lateDays    = records.filter((r) => r.status === 'LATE').length;
  const absentDays  = records.filter((r) => r.status === 'ABSENT').length;

  // ── Clock-in/out panel state styles ────────────────────────────────────────
  const panelStyle = isDayDone
    ? 'from-emerald-500 to-teal-600'
    : isCheckedIn
    ? 'from-primary-600 to-cyan-600'
    : 'from-slate-700 to-slate-800';

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
        row.clock_in
          ? <span className="text-green-600 font-medium">{format(new Date(row.clock_in), 'h:mm a')}</span>
          : <span className="text-gray-300">—</span>,
    },
    {
      key: 'clock_out',
      header: 'Clock Out',
      render: (row: Attendance) =>
        row.clock_out
          ? <span className="text-primary-600 font-medium">{format(new Date(row.clock_out), 'h:mm a')}</span>
          : <span className="text-gray-300">—</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (row: Attendance) => {
        if (!row.clock_in || !row.clock_out) return <span className="text-gray-300">—</span>;
        const secs = differenceInSeconds(new Date(row.clock_out), new Date(row.clock_in));
        return <span className="font-medium">{formatDuration(secs)}</span>;
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

        {/* ── Main Clock Panel ─────────────────────────────────────────── */}
        <div className={`rounded-2xl bg-gradient-to-br ${panelStyle} text-white overflow-hidden shadow-xl`}>
          <div className="p-8 flex flex-col lg:flex-row items-center gap-8">

            {/* Left — big clock button */}
            <div className="flex flex-col items-center gap-4 flex-shrink-0">
              {/* Clock-in button */}
              {notStarted && !loadingToday && (
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-25 scale-110" />
                  <button
                    onClick={() => clockInMutation.mutate()}
                    disabled={clockInMutation.isPending}
                    className="relative w-36 h-36 rounded-full bg-white/15 hover:bg-white/25 border-4 border-white/60 hover:border-white shadow-2xl transition-all duration-200 flex flex-col items-center justify-center gap-1 group active:scale-95 disabled:opacity-60"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-400 group-hover:bg-green-300 flex items-center justify-center shadow-lg transition-colors">
                      {clockInMutation.isPending
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <LogIn className="w-6 h-6 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">CLOCK IN</span>
                  </button>
                </div>
              )}

              {/* Clock-out button */}
              {isCheckedIn && (
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20 scale-110" />
                  <button
                    onClick={() => clockOutMutation.mutate()}
                    disabled={clockOutMutation.isPending}
                    className="relative w-36 h-36 rounded-full bg-white/15 hover:bg-white/25 border-4 border-white/60 hover:border-white shadow-2xl transition-all duration-200 flex flex-col items-center justify-center gap-1 group active:scale-95 disabled:opacity-60"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-400 group-hover:bg-red-300 flex items-center justify-center shadow-lg transition-colors">
                      {clockOutMutation.isPending
                        ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <LogOut className="w-6 h-6 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-white tracking-wide">CLOCK OUT</span>
                  </button>
                </div>
              )}

              {/* Day complete */}
              {isDayDone && (
                <div className="w-36 h-36 rounded-full bg-white/15 border-4 border-white/40 flex flex-col items-center justify-center gap-1 shadow-xl">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                  <span className="text-xs font-bold text-white/90 tracking-wide text-center">DAY<br/>COMPLETE</span>
                </div>
              )}
            </div>

            {/* Right — info */}
            <div className="flex-1 text-center lg:text-left">
              {/* Live time */}
              <p className="text-white/60 text-sm font-medium mb-1">
                {format(now, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-5xl font-extrabold tracking-tight tabular-nums mb-4">
                {format(now, 'hh:mm')}
                <span className="text-3xl text-white/70">{format(now, ':ss')}</span>
                <span className="text-2xl text-white/70 ml-2">{format(now, 'a')}</span>
              </p>

              {/* Status message */}
              {notStarted && !loadingToday && (
                <p className="text-white/80 text-lg font-medium mb-4">
                  You haven't clocked in yet. Tap the button to start your day.
                </p>
              )}
              {isCheckedIn && (
                <p className="text-white/80 text-lg font-medium mb-4">
                  You're currently clocked in. Have a great day!
                </p>
              )}
              {isDayDone && (
                <p className="text-white/80 text-lg font-medium mb-4">
                  Great work! Your attendance is recorded for today.
                </p>
              )}

              {/* Clock-in / Clock-out times + duration */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                {today?.clock_in && (
                  <div className="bg-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
                    <Sunrise className="w-5 h-5 text-yellow-300 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 text-xs font-medium">Clocked In</p>
                      <p className="text-white font-bold text-lg tabular-nums">
                        {format(new Date(today.clock_in), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
                {today?.clock_out && (
                  <div className="bg-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
                    <Sunset className="w-5 h-5 text-orange-300 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 text-xs font-medium">Clocked Out</p>
                      <p className="text-white font-bold text-lg tabular-nums">
                        {format(new Date(today.clock_out), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                )}
                {elapsedSeconds > 0 && (
                  <div className="bg-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
                    <Timer className="w-5 h-5 text-cyan-200 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 text-xs font-medium">
                        {isDayDone ? 'Total Duration' : 'Time Elapsed'}
                      </p>
                      <p className="text-white font-bold text-lg tabular-nums">
                        {formatDuration(elapsedSeconds)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status badge */}
              {today?.status && (
                <div className="mt-4 flex justify-center lg:justify-start">
                  <StatusBadge status={today.status} />
                </div>
              )}
            </div>
          </div>

          {/* Bottom progress bar (fills as day progresses, assuming 8h workday) */}
          {isCheckedIn && (
            <div className="h-1.5 bg-white/10">
              <div
                className="h-full bg-white/50 transition-all duration-1000"
                style={{ width: `${Math.min((elapsedSeconds / 28800) * 100, 100).toFixed(1)}%` }}
              />
            </div>
          )}
          {isDayDone && <div className="h-1.5 bg-white/30" />}
        </div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Present Days"   value={presentDays}    subtitle="This month" icon={Clock}    color="green"   />
          <StatCard title="Late Arrivals"  value={lateDays}       subtitle="This month" icon={Clock}    color="orange"  />
          <StatCard title="Absent Days"    value={absentDays}     subtitle="This month" icon={Calendar} color="red"     />
          <StatCard title="Total Records"  value={records.length} subtitle="Last 30 days" icon={Calendar} color="primary" />
        </div>

        {/* ── History ──────────────────────────────────────────────────── */}
        <Card padding="sm">
          <div className="px-2 py-3 mb-4">
            <h3 className="font-semibold text-gray-800">Attendance History</h3>
            <p className="text-sm text-gray-500">Last 30 records</p>
          </div>
          <Table
            columns={columns as unknown as Parameters<typeof Table>[0]['columns']}
            data={records as unknown as Record<string, unknown>[]}
            emptyMessage="No attendance records found"
            isLoading={loadingHistory}
          />
        </Card>

      </div>
    </DashboardLayout>
  );
}
