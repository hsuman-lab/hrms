'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock, CalendarDays, DollarSign, Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { employeeService } from '@/services/employee.service';
import { attendanceService } from '@/services/attendance.service';
import { leaveService } from '@/services/leave.service';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => employeeService.getDashboard(),
  });

  const { data: todayAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: () => attendanceService.getToday(),
  });

  const { data: recentLeaves } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: () => leaveService.getMyLeaves(),
  });

  const stats = dashboard as {
    attendanceCount?: number;
    pendingLeave?: number;
    leaveBalances?: Array<{ leave_type: { leave_name: string }; remaining_days: number; used_days: number }>;
    todayAttendance?: { clock_in?: string; clock_out?: string; status?: string };
  } | undefined;

  const clockedIn = todayAttendance?.clock_in;
  const clockedOut = todayAttendance?.clock_out;

  return (
    <DashboardLayout
      title={`Good ${getGreeting()}, ${user?.employee?.first_name || 'there'}!`}
      subtitle="Here's what's happening today"
    >
      <div className="space-y-6">
        {/* Today's Status */}
        <Card className="bg-gradient-to-r from-primary-600 to-teal-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm font-medium">Today's Status</p>
              <p className="text-2xl font-bold mt-1">
                {clockedOut ? 'Work Complete' : clockedIn ? 'Currently Working' : 'Not Checked In'}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-primary-100">
                {todayAttendance?.clock_in && (
                  <span>In: {format(new Date(todayAttendance.clock_in), 'h:mm a')}</span>
                )}
                {todayAttendance?.clock_out && (
                  <span>Out: {format(new Date(todayAttendance.clock_out), 'h:mm a')}</span>
                )}
                {todayAttendance?.status && <StatusBadge status={todayAttendance.status} />}
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Days Present (This Month)"
            value={stats?.attendanceCount ?? 0}
            subtitle="Working days attended"
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Pending Leave Requests"
            value={stats?.pendingLeave ?? 0}
            subtitle="Awaiting approval"
            icon={CalendarDays}
            color="orange"
          />
          <StatCard
            title="Employee Code"
            value={user?.employee?.employee_code ?? '-'}
            subtitle={user?.employee?.department ?? 'Department'}
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Leave Balance"
            value={stats?.leaveBalances?.[0]?.remaining_days ?? 0}
            subtitle={stats?.leaveBalances?.[0]?.leave_type?.leave_name ?? 'Casual Leave'}
            icon={TrendingUp}
            color="teal"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leave Balances */}
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-600" />
              Leave Balances
            </h3>
            <div className="space-y-3">
              {(stats?.leaveBalances ?? []).map((lb) => {
                const used = lb.used_days ?? 0;
                const total = (lb.remaining_days ?? 0) + used;
                const pct = total > 0 ? Math.round((used / total) * 100) : 0;
                return (
                  <div key={lb.leave_type?.leave_name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{lb.leave_type?.leave_name}</span>
                      <span className="text-gray-500">{lb.remaining_days ?? 0} / {total} remaining</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${100 - pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(!stats?.leaveBalances || stats.leaveBalances.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No leave balances configured</p>
              )}
            </div>
          </Card>

          {/* Recent Leave Requests */}
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileIcon className="w-5 h-5 text-primary-600" />
              Recent Leave Requests
            </h3>
            <div className="space-y-3">
              {(recentLeaves ?? []).slice(0, 5).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{leave.leave_type?.leave_name}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                      {' '}· {leave.total_days} day{(leave.total_days ?? 0) > 1 ? 's' : ''}
                    </p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))}
              {(!recentLeaves || recentLeaves.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No leave requests yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
