'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Receipt, Plus, IndianRupee, Clock, CheckCircle2, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { reimbursementService } from '@/services/reimbursement.service';
import { Reimbursement, ReimbursementCategory } from '@/types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORIES: { value: ReimbursementCategory; label: string; icon: string }[] = [
  { value: 'TRAVEL',        label: 'Travel',        icon: '✈️' },
  { value: 'FOOD',          label: 'Food & Meals',  icon: '🍽️' },
  { value: 'MEDICAL',       label: 'Medical',       icon: '🏥' },
  { value: 'ACCOMMODATION', label: 'Accommodation', icon: '🏨' },
  { value: 'OTHER',         label: 'Other',         icon: '📎' },
];

const STATUS_CFG = {
  PENDING:  { label: 'Pending',  bg: 'bg-yellow-50', text: 'text-yellow-700', icon: Clock },
  APPROVED: { label: 'Approved', bg: 'bg-green-50',  text: 'text-green-700',  icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', bg: 'bg-red-50',    text: 'text-red-600',    icon: XCircle },
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// ─── Submit Modal ────────────────────────────────────────────────────────────
function SubmitModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ category: 'TRAVEL' as ReimbursementCategory, amount: '', description: '', billDate: '' });

  const mutation = useMutation({
    mutationFn: () => reimbursementService.apply({
      category: form.category,
      amount: Number(form.amount),
      description: form.description.trim(),
      billDate: form.billDate,
    }),
    onSuccess: () => {
      toast.success('Reimbursement claim submitted');
      queryClient.invalidateQueries({ queryKey: ['my-reimbursements'] });
      onClose();
    },
    onError: (e: { response?: { data?: { error?: string } } }) =>
      toast.error(e?.response?.data?.error || 'Submission failed'),
  });

  const valid = form.amount && Number(form.amount) > 0 && form.description.trim().length >= 5 && form.billDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-5">Submit Reimbursement Claim</h3>

        <div className="space-y-4">
          {/* Category tiles */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category *</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.value} type="button"
                  onClick={() => setForm({ ...form, category: c.value })}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    form.category === c.value
                      ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                      : 'border-gray-100 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="leading-tight text-center" style={{ fontSize: '0.65rem' }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Amount (₹) *</label>
              <input type="number" min="1" step="0.01" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 1500"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bill Date *</label>
              <input type="date" value={form.billDate}
                onChange={(e) => setForm({ ...form, billDate: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description * <span className="text-gray-400 font-normal">(min 5 chars)</span></label>
            <textarea rows={3} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the expense — e.g. Cab fare from office to client site on project day"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => mutation.mutate()}
            disabled={!valid || mutation.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
            {mutation.isPending ? 'Submitting…' : 'Submit Claim'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Claim card ───────────────────────────────────────────────────────────────
function ClaimCard({ r }: { r: Reimbursement }) {
  const cfg = STATUS_CFG[r.status] ?? STATUS_CFG.PENDING;
  const StatusIcon = cfg.icon;
  const cat = CATEGORIES.find((c) => c.value === r.category);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl">
            {cat?.icon ?? '📎'}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{cat?.label ?? r.category}</p>
            <p className="text-xs text-gray-400">Bill: {format(parseISO(r.bill_date), 'MMM d, yyyy')}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
          <StatusIcon className="w-3 h-3" /> {cfg.label}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{r.description}</p>

      <div className="flex items-center justify-between">
        <span className="font-bold text-primary-700 text-base">{fmt(Number(r.amount))}</span>
        <span className="text-xs text-gray-400">Applied {format(parseISO(r.applied_at), 'MMM d, yyyy')}</span>
      </div>

      {r.approvals && r.approvals.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
          {r.approvals.map((a) => (
            <div key={a.id} className="flex items-center gap-2">
              <span className={a.approval_status === 'APPROVED' ? 'text-green-600' : 'text-red-500'}>
                {a.approval_status === 'APPROVED' ? '✓' : '✗'} {a.approver.first_name} {a.approver.last_name}
              </span>
              {a.remarks && <span className="text-gray-400">· "{a.remarks}"</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ReimbursementPage() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]       = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ['my-reimbursements'],
    queryFn: reimbursementService.getMine,
  });

  const pending  = claims.filter((c) => c.status === 'PENDING').length;
  const approved = claims.filter((c) => c.status === 'APPROVED').length;
  const totalApproved = claims.filter((c) => c.status === 'APPROVED').reduce((s, c) => s + Number(c.amount), 0);

  const filtered = filter === 'ALL' ? claims : claims.filter((c) => c.status === filter);

  return (
    <DashboardLayout title="Reimbursements" subtitle="Submit and track your expense claims">
      {showModal && <SubmitModal onClose={() => setShowModal(false)} />}

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Claims"    value={claims.length}  subtitle="All time"       icon={Receipt}       color="primary" />
          <StatCard title="Pending"         value={pending}        subtitle="Awaiting manager" icon={Clock}        color="orange"  />
          <StatCard title="Approved"        value={approved}       subtitle="This year"      icon={CheckCircle2}  color="green"   />
          <StatCard title="Approved Amount" value={fmt(totalApproved)} subtitle="Total credited" icon={IndianRupee} color="green"   />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                <span className="ml-1.5 text-xs opacity-70">
                  {f === 'ALL' ? claims.length : claims.filter((c) => c.status === f).length}
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> New Claim
          </button>
        </div>

        {/* Claims grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map((i) => <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <div className="py-16 text-center text-gray-400">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No claims found</p>
              <p className="text-sm mt-1">Click "New Claim" to submit an expense.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((r) => <ClaimCard key={r.id} r={r} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
