'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Table from '@/components/ui/Table';
import { employeeService } from '@/services/employee.service';
import { attendanceService } from '@/services/attendance.service';
import { Employee } from '@/types';
import { format } from 'date-fns';

export default function TeamPage() {
  const [attendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: team, isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: () => employeeService.getTeam(),
  });

  const { data: teamAttendance } = useQuery({
    queryKey: ['team-attendance', attendanceDate],
    queryFn: () => attendanceService.getTeamAttendance(attendanceDate),
  });

  const teamAtt = teamAttendance as Array<{
    id: string; first_name: string; last_name: string; employee_code: string;
    attendance: { clock_in?: string; clock_out?: string; status?: string } | null;
  }> | undefined;

  const presentToday = (teamAtt ?? []).filter((m) => m.attendance?.status === 'PRESENT' || m.attendance?.status === 'LATE').length;

  const columns = [
    {
      key: 'name',
      header: 'Employee',
      render: (row: Employee) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700">
            {row.first_name?.[0]}{row.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-800">{row.first_name} {row.last_name}</p>
            <p className="text-xs text-gray-400">#{row.employee_code}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', render: (row: Employee) => row.department?.department_name ?? '—' },
    {
      key: 'status',
      header: 'Employment',
      render: (row: Employee) => <StatusBadge status={row.employment_status} />,
    },
    {
      key: 'joining_date',
      header: 'Joined',
      render: (row: Employee) => row.joining_date ? format(new Date(row.joining_date), 'MMM d, yyyy') : '—',
    },
    {
      key: 'user',
      header: 'Email',
      render: (row: Employee) => <span className="text-sm text-gray-500">{row.user?.email}</span>,
    },
  ];

  return (
    <DashboardLayout title="My Team" subtitle="View team members and their attendance">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Team Size" value={(team ?? []).length} icon={Users} color="primary" />
          <StatCard title="Present Today" value={presentToday} subtitle="Checked in" icon={Clock} color="green" />
          <StatCard title="Absent Today" value={(team ?? []).length - presentToday} subtitle="Not checked in" icon={Clock} color="orange" />
        </div>

        {/* Today's Attendance Summary */}
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Today's Team Attendance — {format(new Date(), 'MMMM d, yyyy')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(teamAtt ?? []).map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{member.first_name} {member.last_name}</p>
                  <p className="text-xs text-gray-400">
                    {member.attendance?.clock_in ? `In: ${format(new Date(member.attendance.clock_in), 'h:mm a')}` : 'Not checked in'}
                  </p>
                </div>
                {member.attendance?.status ? (
                  <StatusBadge status={member.attendance.status} />
                ) : (
                  <StatusBadge status="ABSENT" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Team Table */}
        <Card padding="sm">
          <div className="px-2 py-3 mb-4">
            <h3 className="font-semibold text-gray-800">Team Members</h3>
          </div>
          <Table
            columns={columns as Parameters<typeof Table>[0]['columns']}
            data={(team ?? []) as unknown as Record<string, unknown>[]}
            emptyMessage="No team members assigned to you"
            isLoading={isLoading}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
