'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { hrService } from '@/services/hr.service';
import { attendanceService } from '@/services/attendance.service';
import { leaveService } from '@/services/leave.service';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const now = new Date();
  const { data: analytics } = useQuery({ queryKey: ['hr-analytics'], queryFn: () => hrService.getAnalytics() });
  const { data: attendanceReport } = useQuery({
    queryKey: ['attendance-report', now.getFullYear(), now.getMonth() + 1],
    queryFn: () => attendanceService.getMonthlyReport(now.getFullYear(), now.getMonth() + 1),
  });
  const { data: allLeaves } = useQuery({
    queryKey: ['all-leaves', 'hr'],
    queryFn: () => leaveService.getAllLeaves({ month: now.getMonth() + 1, year: now.getFullYear() }),
  });

  const stats = analytics as { totalEmployees?: number; byDepartment?: Array<{ department: string; count: number }> } | undefined;
  const attendance = attendanceReport as Array<{ employee: { employee_code: string }; status: string }> | undefined;

  const attendanceSummary = {
    present: (attendance ?? []).filter((r) => r.status === 'PRESENT').length,
    late: (attendance ?? []).filter((r) => r.status === 'LATE').length,
    absent: (attendance ?? []).filter((r) => r.status === 'ABSENT').length,
    halfDay: (attendance ?? []).filter((r) => r.status === 'HALF_DAY').length,
  };

  const leaveStatusData = [
    { name: 'Pending', value: (allLeaves ?? []).filter((l) => l.status === 'PENDING').length },
    { name: 'Approved', value: (allLeaves ?? []).filter((l) => l.status === 'APPROVED').length },
    { name: 'Rejected', value: (allLeaves ?? []).filter((l) => l.status === 'REJECTED').length },
  ];

  return (
    <DashboardLayout title="HR Analytics" subtitle={`Organization overview for ${format(now, 'MMMM yyyy')}`}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Present', value: attendanceSummary.present, color: 'bg-green-100 text-green-700' },
            { label: 'Late', value: attendanceSummary.late, color: 'bg-orange-100 text-orange-700' },
            { label: 'Absent', value: attendanceSummary.absent, color: 'bg-red-100 text-red-700' },
            { label: 'Half Day', value: attendanceSummary.halfDay, color: 'bg-blue-100 text-blue-700' },
          ].map((s) => (
            <Card key={s.label} padding="sm">
              <p className="text-xs font-medium text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color.split(' ')[1]}`}>{s.value}</p>
              <p className="text-xs text-gray-400">This month</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Headcount by Department
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.byDepartment ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f9fa" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Employees" fill="#00ACC1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-800 mb-4">Leave Requests This Month</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={leaveStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f9fa" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" name="Requests" fill="#4DD0E1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
