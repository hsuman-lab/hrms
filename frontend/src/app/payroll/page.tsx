'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IndianRupee, TrendingDown, Download, FileText, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import { payrollService } from '@/services/payroll.service';
import { PayrollRecord } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { downloadSalarySlipPdf } from '@/utils/salarySlipPdf';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// ─── Salary Slip Download Panel ───────────────────────────────────────────────
function SalarySlipPanel({ records }: { records: PayrollRecord[] }) {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [open, setOpen] = useState(false);

  // last 12 records
  const slips = records.slice(0, 12);
  const selected = slips.find((r) => r.id === selectedId) ?? slips[0] ?? null;

  const handleDownload = async () => {
    if (!selected) return;
    setDownloading(true);
    try {
      const name = [user?.employee?.first_name, user?.employee?.last_name].filter(Boolean).join(' ') || 'Employee';
      const code = user?.employee?.employee_code ?? 'N/A';
      const dept = user?.employee?.department ?? 'N/A';
      await downloadSalarySlipPdf(selected, name, code, typeof dept === 'string' ? dept : (dept as { department_name?: string })?.department_name ?? 'N/A');
      toast.success(`Salary slip for ${MONTHS_FULL[selected.payroll_month - 1]} ${selected.payroll_year} downloaded`);
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (slips.length === 0) return null;

  const displayRecord = (selectedId ? slips.find((r) => r.id === selectedId) : slips[0]) ?? slips[0];

  return (
    <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-cyan-50 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-primary-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Download Salary Slip</p>
            <p className="text-xs text-gray-500">Select a month and download as PDF</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-end gap-4">
        {/* Month selector */}
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Select Pay Period
          </label>
          <div className="relative">
            <select
              value={selectedId || slips[0]?.id || ''}
              onChange={(e) => { setSelectedId(e.target.value); setOpen(false); }}
              className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-sm"
            >
              {slips.map((r) => (
                <option key={r.id} value={r.id}>
                  {MONTHS_FULL[r.payroll_month - 1]} {r.payroll_year}
                  {' '}— Net: {fmt(Number(r.net_salary ?? 0))}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Preview mini card */}
        {displayRecord && (
          <div className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 px-5 py-3 shadow-sm text-sm shrink-0">
            <div className="text-center">
              <p className="text-xs text-gray-400 font-medium">Gross</p>
              <p className="font-semibold text-gray-800">{fmt(Number(displayRecord.salary_amount ?? 0))}</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <p className="text-xs text-gray-400 font-medium">Deductions</p>
              <p className="font-semibold text-red-500">-{fmt(Number(displayRecord.deductions ?? 0))}</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <p className="text-xs text-gray-400 font-medium">Net Pay</p>
              <p className="font-bold text-primary-700 text-base">{fmt(Number(displayRecord.net_salary ?? 0))}</p>
            </div>
          </div>
        )}

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading || !selected}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-colors whitespace-nowrap"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* Slip grid — last 12 months quick-pick */}
      <div className="px-6 pb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quick Select — Last {slips.length} Months</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {slips.map((r) => {
            const isActive = (selectedId || slips[0]?.id) === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 border-primary-600 text-white shadow-md scale-105'
                    : 'bg-white border-gray-100 text-gray-600 hover:border-primary-300 hover:text-primary-700'
                }`}
              >
                <span className="font-bold text-sm">{MONTHS[r.payroll_month - 1]}</span>
                <span className={isActive ? 'text-white/70' : 'text-gray-400'}>{r.payroll_year}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function MyPayrollPage() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['my-payroll'],
    queryFn: () => payrollService.getMyPayroll(),
  });

  const latest = records[0];
  const totalEarned = records.reduce((sum, r) => sum + Number(r.net_salary ?? 0), 0);

  const columns = [
    { key: 'period',            header: 'Period',       render: (r: PayrollRecord) => `${MONTHS[r.payroll_month - 1]} ${r.payroll_year}` },
    { key: 'total_working_days',header: 'Work Days',    render: (r: PayrollRecord) => r.total_working_days ?? '—' },
    { key: 'present_days',      header: 'Present',      render: (r: PayrollRecord) => <span className="text-green-600">{r.present_days ?? '—'}</span> },
    { key: 'paid_leave_days',   header: 'Paid Leave',   render: (r: PayrollRecord) => r.paid_leave_days ?? 0 },
    { key: 'unpaid_leave_days', header: 'Unpaid',       render: (r: PayrollRecord) => r.unpaid_leave_days ?? 0 },
    { key: 'salary_amount',     header: 'Gross',        render: (r: PayrollRecord) => fmt(Number(r.salary_amount ?? 0)) },
    { key: 'deductions',        header: 'Deductions',   render: (r: PayrollRecord) => <span className="text-red-500">-{fmt(Number(r.deductions ?? 0))}</span> },
    { key: 'net_salary',        header: 'Net Salary',   render: (r: PayrollRecord) => <span className="font-bold text-primary-700">{fmt(Number(r.net_salary ?? 0))}</span> },
    {
      key: 'slip',
      header: 'Salary Slip',
      render: (r: PayrollRecord) => <SlipButton record={r} />,
    },
  ];

  return (
    <DashboardLayout title="My Payroll" subtitle="View your payroll history and download salary slips">
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Last Month Net"
            value={latest ? fmt(Number(latest.net_salary ?? 0)) : '—'}
            subtitle={latest ? `${MONTHS[latest.payroll_month - 1]} ${latest.payroll_year}` : 'No records yet'}
            icon={IndianRupee}
            color="primary"
          />
          <StatCard
            title="Last Month Deductions"
            value={latest ? fmt(Number(latest.deductions ?? 0)) : '—'}
            subtitle="Unpaid leave + Absences"
            icon={TrendingDown}
            color="red"
          />
          <StatCard
            title="YTD Earnings"
            value={fmt(totalEarned)}
            subtitle="Year to date net"
            icon={IndianRupee}
            color="green"
          />
        </div>

        {/* Salary slip download panel */}
        {!isLoading && <SalarySlipPanel records={records} />}

        {/* History table */}
        <Card padding="sm">
          <div className="px-2 py-3 mb-4">
            <h3 className="font-semibold text-gray-800">Payroll History</h3>
          </div>
          <Table
            columns={columns as unknown as Parameters<typeof Table>[0]['columns']}
            data={records as unknown as Record<string, unknown>[]}
            emptyMessage="No payroll records found. Contact HR if this is unexpected."
            isLoading={isLoading}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ─── Inline per-row slip button (used in table) ───────────────────────────────
function SlipButton({ record }: { record: PayrollRecord }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const name = [user?.employee?.first_name, user?.employee?.last_name].filter(Boolean).join(' ') || 'Employee';
      const code = user?.employee?.employee_code ?? 'N/A';
      const dept = user?.employee?.department;
      await downloadSalarySlipPdf(record, name, code, typeof dept === 'string' ? dept : (dept as { department_name?: string })?.department_name ?? 'N/A');
    } catch {
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 disabled:opacity-50 transition-colors"
    >
      {loading
        ? <div className="w-3.5 h-3.5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        : <Download className="w-3.5 h-3.5" />}
      PDF
    </button>
  );
}
