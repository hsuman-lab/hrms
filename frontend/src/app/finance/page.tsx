'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Download, RefreshCw, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { payrollService } from '@/services/payroll.service';
import { PayrollRecord } from '@/types';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function FinancePage() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['payroll', month, year],
    queryFn: () => payrollService.getMonthly(month, year),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['payroll-summary', year],
    queryFn: () => payrollService.getSummary(year),
  });

  const generateMutation = useMutation({
    mutationFn: () => payrollService.generate(month, year),
    onSuccess: (data) => {
      const result = data as { data?: { generated?: number } };
      toast.success(`Payroll generated for ${result.data?.generated ?? 0} employees`);
      queryClient.invalidateQueries({ queryKey: ['payroll', month, year] });
    },
    onError: () => toast.error('Failed to generate payroll'),
  });

  const exportMutation = useMutation({
    mutationFn: () => payrollService.exportCSV(month, year),
    onSuccess: () => toast.success('CSV exported successfully'),
    onError: () => toast.error('Failed to export CSV'),
  });

  const records = payrollData ?? [];
  const totalNet = records.reduce((sum, r) => sum + Number(r.net_salary ?? 0), 0);
  const totalDeductions = records.reduce((sum, r) => sum + Number(r.deductions ?? 0), 0);
  const totalGross = records.reduce((sum, r) => sum + Number(r.salary_amount ?? 0), 0);

  const summaryChartData = ((summaryData as Array<{ payroll_month: number; _sum: { net_salary?: number } }>) ?? []).map((s) => ({
    month: MONTHS[s.payroll_month - 1],
    netSalary: Number(s._sum?.net_salary ?? 0),
  }));

  const columns = [
    {
      key: 'employee',
      header: 'Employee',
      render: (r: PayrollRecord) => (
        <div>
          <p className="font-medium">{r.employee?.first_name} {r.employee?.last_name}</p>
          <p className="text-xs text-gray-400">#{r.employee?.employee_code} · {r.employee?.department?.department_name}</p>
        </div>
      ),
    },
    { key: 'total_working_days', header: 'Work Days', render: (r: PayrollRecord) => r.total_working_days ?? '—' },
    { key: 'present_days', header: 'Present', render: (r: PayrollRecord) => <span className="text-green-600">{r.present_days ?? '—'}</span> },
    { key: 'paid_leave_days', header: 'Paid Leave', render: (r: PayrollRecord) => r.paid_leave_days ?? 0 },
    { key: 'unpaid_leave_days', header: 'Unpaid Leave', render: (r: PayrollRecord) => <span className="text-red-500">{r.unpaid_leave_days ?? 0}</span> },
    { key: 'absent_days', header: 'Absent', render: (r: PayrollRecord) => <span className="text-red-400">{r.absent_days ?? 0}</span> },
    { key: 'salary_amount', header: 'Gross', render: (r: PayrollRecord) => `$${Number(r.salary_amount ?? 0).toLocaleString()}` },
    { key: 'deductions', header: 'Deductions', render: (r: PayrollRecord) => <span className="text-red-500">-${Number(r.deductions ?? 0).toLocaleString()}</span> },
    { key: 'net_salary', header: 'Net Salary', render: (r: PayrollRecord) => <span className="font-bold text-primary-700">${Number(r.net_salary ?? 0).toLocaleString()}</span> },
  ];

  return (
    <DashboardLayout title="Payroll Dashboard" subtitle="Finance and payroll management">
      <div className="space-y-6">
        {/* Month/Year Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button variant="secondary" leftIcon={RefreshCw} onClick={() => generateMutation.mutate()} isLoading={generateMutation.isPending}>
            Generate Payroll
          </Button>
          <Button leftIcon={Download} onClick={() => exportMutation.mutate()} isLoading={exportMutation.isPending} disabled={records.length === 0}>
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Gross Salary" value={`$${totalGross.toLocaleString()}`} subtitle={`${MONTHS[month - 1]} ${year}`} icon={DollarSign} color="primary" />
          <StatCard title="Total Deductions" value={`$${totalDeductions.toLocaleString()}`} subtitle="Unpaid + Absent" icon={TrendingUp} color="red" />
          <StatCard title="Total Net Payout" value={`$${totalNet.toLocaleString()}`} subtitle={`${records.length} employees`} icon={DollarSign} color="green" />
        </div>

        {/* Yearly Trend */}
        {summaryChartData.length > 0 && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-4">Monthly Payroll Trend — {year}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={summaryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f9fa" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Net Salary']} />
                <Bar dataKey="netSalary" fill="#00ACC1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Payroll Table */}
        <Card padding="sm">
          <div className="px-2 py-3 mb-2">
            <h3 className="font-semibold text-gray-800">
              Payroll Records — {MONTHS[month - 1]} {year}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {records.length} records · Generated: {records[0] ? format(new Date(records[0].generated_at), 'MMM d, yyyy h:mm a') : 'Not yet generated'}
            </p>
          </div>
          <Table
            columns={columns as Parameters<typeof Table>[0]['columns']}
            data={records as unknown as Record<string, unknown>[]}
            emptyMessage="No payroll data. Click Generate Payroll to create records."
            isLoading={isLoading}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
