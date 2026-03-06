'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Building2, BarChart3, Clock, CalendarDays } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { hrService } from '@/services/hr.service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#00ACC1', '#4DD0E1', '#00897B', '#26C6DA', '#80DEEA'];

export default function HRPage() {
  const { data: analytics } = useQuery({
    queryKey: ['hr-analytics'],
    queryFn: () => hrService.getAnalytics(),
  });

  const stats = analytics as {
    totalEmployees?: number;
    attendanceToday?: number;
    pendingLeaves?: number;
    byDepartment?: Array<{ department: string; count: number }>;
    byRole?: Array<{ role: string; count: number }>;
  } | undefined;

  return (
    <DashboardLayout title="HR Dashboard" subtitle="Organization analytics and overview">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Active Employees" value={stats?.totalEmployees ?? 0} icon={Users} color="primary" />
          <StatCard title="Present Today" value={stats?.attendanceToday ?? 0} icon={Clock} color="green" />
          <StatCard title="Pending Leave Requests" value={stats?.pendingLeaves ?? 0} icon={CalendarDays} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Department */}
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary-600" />
              Employees by Department
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.byDepartment ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f9fa" />
                <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E0F7FA', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="#00ACC1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* By Role */}
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Employees by Role
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats?.byRole ?? []}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ role, percent }) => `${role.replace('_', ' ')}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(stats?.byRole ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend formatter={(v) => v.replace('_', ' ')} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Manage Employees', desc: 'View, add & update employee profiles', href: '/hr/employees', icon: Users },
            { title: 'Leave Types', desc: 'Configure leave policies and types', href: '/hr/leave-types', icon: CalendarDays },
            { title: 'Departments', desc: 'Manage department structure', href: '/hr/departments', icon: Building2 },
          ].map((item) => (
            <a key={item.href} href={item.href}>
              <Card className="hover:shadow-card-hover transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                    <item.icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
