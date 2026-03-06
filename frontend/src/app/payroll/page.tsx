'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { payrollService } from '@/services/payroll.service';
import { PayrollRecord } from '@/types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function MyPayrollPage() {
  const { data: records, isLoading } = useQuery({
    queryKey: ['my-payroll'],
    queryFn: () => payrollService.getMyPayroll(),
  });

  const latest = records?.[0];
  const totalEarned = (records ?? []).reduce((sum, r) => sum + Number(r.net_salary ?? 0), 0);

  const columns = [
    { key: 'period', header: 'Period', render: (r: PayrollRecord) => `${MONTHS[r.payroll_month - 1]} ${r.payroll_year}` },
    { key: 'total_working_days', header: 'Work Days', render: (r: PayrollRecord) => r.total_working_days ?? '—' },
    { key: 'present_days', header: 'Present', render: (r: PayrollRecord) => <span className="text-green-600">{r.present_days ?? '—'}</span> },
    { key: 'paid_leave_days', header: 'Paid Leave', render: (r: PayrollRecord) => r.paid_leave_days ?? 0 },
    { key: 'unpaid_leave_days', header: 'Unpaid', render: (r: PayrollRecord) => r.unpaid_leave_days ?? 0 },
    { key: 'salary_amount', header: 'Gross', render: (r: PayrollRecord) => `$${Number(r.salary_amount ?? 0).toLocaleString()}` },
    { key: 'deductions', header: 'Deductions', render: (r: PayrollRecord) => <span className="text-red-500">-${Number(r.deductions ?? 0).toLocaleString()}</span> },
    { key: 'net_salary', header: 'Net Salary', render: (r: PayrollRecord) => <span className="font-bold text-primary-700">${Number(r.net_salary ?? 0).toLocaleString()}</span> },
  ];

  return (
    <DashboardLayout title="My Payroll" subtitle="View your payroll history">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Last Month Net"
            value={latest ? `$${Number(latest.net_salary ?? 0).toLocaleString()}` : '—'}
            subtitle={latest ? `${MONTHS[latest.payroll_month - 1]} ${latest.payroll_year}` : 'No records yet'}
            icon={DollarSign}
            color="primary"
          />
          <StatCard
            title="Last Month Deductions"
            value={latest ? `$${Number(latest.deductions ?? 0).toLocaleString()}` : '—'}
            subtitle="Unpaid leave + Absences"
            icon={TrendingDown}
            color="red"
          />
          <StatCard
            title="YTD Earnings"
            value={`$${totalEarned.toLocaleString()}`}
            subtitle="Year to date net"
            icon={DollarSign}
            color="green"
          />
        </div>

        <Card padding="sm">
          <div className="px-2 py-3 mb-4">
            <h3 className="font-semibold text-gray-800">Payroll History</h3>
          </div>
          <Table
            columns={columns as Parameters<typeof Table>[0]['columns']}
            data={(records ?? []) as unknown as Record<string, unknown>[]}
            emptyMessage="No payroll records found. Contact HR if this is unexpected."
            isLoading={isLoading}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
