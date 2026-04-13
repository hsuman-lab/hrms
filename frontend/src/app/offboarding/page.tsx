'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DoorOpen, AlertTriangle, CheckCircle2, MessageSquare, IndianRupee, ClipboardList } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { offboardingService } from '@/services/offboarding.service';
import { Resignation, ExitInterview, FnFSettlement } from '@/types';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

type Tab = 'resignation' | 'exit' | 'fnf' | 'checklist';

const TABS = [
  { id: 'resignation' as Tab, label: 'Resignation',     icon: DoorOpen },
  { id: 'exit' as Tab,        label: 'Exit Interview',  icon: MessageSquare },
  { id: 'fnf' as Tab,         label: 'F&F Settlement',  icon: IndianRupee },
  { id: 'checklist' as Tab,   label: 'Checklist',       icon: ClipboardList },
];

const RESIGNATION_REASONS = [
  { value: 'personal',          label: 'Personal' },
  { value: 'health',            label: 'Health' },
  { value: 'medical',           label: 'Medical' },
  { value: 'compensation',      label: 'Compensation' },
  { value: 'monetary_gain',     label: 'Monetary Gain' },
  { value: 'work_life_balance', label: 'Work-Life Balance' },
  { value: 'environment',       label: 'Work Environment' },
  { value: 'learning',          label: 'Learning & Growth' },
  { value: 'others',            label: 'Others' },
];

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-600',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
  PROCESSED: 'bg-blue-50 text-blue-700',
  PAID: 'bg-green-50 text-green-700',
};

// ─── Resignation Tab ──────────────────────────────────────────────────────────
function ResignationTab() {
  const qc = useQueryClient();
  const { data: resignation } = useQuery<Resignation | null>({ queryKey: ['my-resignation'], queryFn: offboardingService.getMyResignation });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ resignationDate: '', reasonCategory: '', reasonDetail: '', noticePeriodDays: '30' });

  const submitMutation = useMutation({
    mutationFn: (d: object) => offboardingService.submitResignation(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-resignation'] }); setShowForm(false); toast.success('Resignation submitted'); },
    onError: (e: { response?: { data?: { error?: string } } }) => toast.error(e?.response?.data?.error || 'Failed to submit'),
  });

  const withdrawMutation = useMutation({
    mutationFn: offboardingService.withdrawResignation,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-resignation'] }); toast.success('Resignation withdrawn'); },
    onError: () => toast.error('Failed to withdraw'),
  });

  if (!resignation || resignation.status === 'WITHDRAWN') {
    return (
      <div className="space-y-4">
        {resignation?.status === 'WITHDRAWN' && (
          <Card className="p-4 bg-gray-50 border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Previous resignation withdrawn.</p>
          </Card>
        )}
        {showForm ? (
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Submit Resignation</h3>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Resignation Date *</label>
              <input type="date" value={form.resignationDate} onChange={e => setForm({ ...form, resignationDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Notice Period (days)</label>
              <input type="number" value={form.noticePeriodDays} onChange={e => setForm({ ...form, noticePeriodDays: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Reason for Resignation</label>
              <select value={form.reasonCategory} onChange={e => setForm({ ...form, reasonCategory: e.target.value, reasonDetail: '' })} className="input-field">
                <option value="">Select a reason…</option>
                {RESIGNATION_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            {form.reasonCategory === 'others' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Please specify</label>
                <textarea value={form.reasonDetail} onChange={e => setForm({ ...form, reasonDetail: e.target.value })} rows={2} className="input-field resize-none" placeholder="Describe your reason…" />
              </div>
            )}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">This will trigger a notification to your reporting manager for approval.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => submitMutation.mutate({ resignationDate: form.resignationDate, noticePeriodDays: +form.noticePeriodDays, reason: form.reasonCategory === 'others' ? (form.reasonDetail || 'Others') : RESIGNATION_REASONS.find(r => r.value === form.reasonCategory)?.label || '' })} disabled={!form.resignationDate || submitMutation.isPending}
                className="btn-primary px-4 py-2 text-sm">Submit Resignation</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
            </div>
          </Card>
        ) : (
          <div className="text-center py-12">
            <DoorOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">No active resignation on file.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary px-5 py-2.5 text-sm">
              Submit Resignation
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Resignation Details</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[resignation.status] || 'bg-gray-100 text-gray-500'}`}>{resignation.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-gray-400 uppercase tracking-wide">Resignation Date</p><p className="font-medium mt-0.5">{format(parseISO(resignation.resignation_date), 'dd MMM yyyy')}</p></div>
          <div><p className="text-xs text-gray-400 uppercase tracking-wide">Notice Period</p><p className="font-medium mt-0.5">{resignation.notice_period_days || '—'} days</p></div>
          {resignation.last_working_date && <div><p className="text-xs text-gray-400 uppercase tracking-wide">Last Working Day</p><p className="font-medium mt-0.5">{format(parseISO(resignation.last_working_date), 'dd MMM yyyy')}</p></div>}
          {resignation.reason && <div className="col-span-2"><p className="text-xs text-gray-400 uppercase tracking-wide">Reason</p><p className="font-medium mt-0.5">{resignation.reason}</p></div>}
        </div>
      </Card>

      {resignation.approvals && resignation.approvals.length > 0 && (
        <Card className="p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Approval Status</h4>
          {resignation.approvals.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <p className="text-sm text-gray-700">{a.approver.first_name} {a.approver.last_name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[a.status || 'PENDING'] || 'bg-gray-100'}`}>{a.status || 'PENDING'}</span>
            </div>
          ))}
        </Card>
      )}

      {resignation.status === 'PENDING' && (
        <button onClick={() => withdrawMutation.mutate()} disabled={withdrawMutation.isPending}
          className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
          Withdraw Resignation
        </button>
      )}
    </div>
  );
}

// ─── Exit Interview Tab ───────────────────────────────────────────────────────
function ExitInterviewTab() {
  const qc = useQueryClient();
  const { data: interview } = useQuery<ExitInterview | null>({ queryKey: ['exit-interview'], queryFn: offboardingService.getExitInterview });
  const [form, setForm] = useState({ reasonLeaving: '', jobSatisfaction: 0, managerRating: 0, cultureRating: 0, rehireEligible: true, suggestions: '' });

  const mutation = useMutation({
    mutationFn: (d: object) => offboardingService.submitExitInterview(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exit-interview'] }); toast.success('Exit interview submitted'); },
    onError: (e: { response?: { data?: { error?: string } } }) => toast.error(e?.response?.data?.error || 'Submission failed'),
  });

  const RatingRow = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${value >= n ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400 hover:bg-primary-100'}`}>{n}</button>
        ))}
      </div>
    </div>
  );

  if (interview?.conducted_at) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-800">Exit Interview Completed</h3>
        </div>
        <div className="space-y-2 text-sm">
          {[['Job Satisfaction', interview.job_satisfaction], ['Manager Rating', interview.manager_rating], ['Culture Rating', interview.culture_rating]].map(([l, v]) => (
            <div key={String(l)} className="flex justify-between"><span className="text-gray-500">{String(l)}</span><span className="font-semibold text-gray-800">{v || '—'}/5</span></div>
          ))}
          {interview.suggestions && <div className="pt-2 border-t"><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Suggestions</p><p className="text-gray-700">{interview.suggestions}</p></div>}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Exit Interview</h3>
        <p className="text-xs text-gray-400">Your honest feedback helps us improve the work environment.</p>
      </div>
      <div className="space-y-4">
        <RatingRow label="Job Satisfaction" value={form.jobSatisfaction} onChange={v => setForm({ ...form, jobSatisfaction: v })} />
        <RatingRow label="Manager" value={form.managerRating} onChange={v => setForm({ ...form, managerRating: v })} />
        <RatingRow label="Company Culture" value={form.cultureRating} onChange={v => setForm({ ...form, cultureRating: v })} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Primary reason for leaving</label>
        <textarea value={form.reasonLeaving} onChange={e => setForm({ ...form, reasonLeaving: e.target.value })} rows={2} className="input-field resize-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Suggestions for improvement</label>
        <textarea value={form.suggestions} onChange={e => setForm({ ...form, suggestions: e.target.value })} rows={2} className="input-field resize-none" />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
        <input type="checkbox" checked={form.rehireEligible} onChange={e => setForm({ ...form, rehireEligible: e.target.checked })} className="rounded" />
        Open to being rehired in the future
      </label>
      <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending}
        className="btn-primary w-full py-2.5 text-sm">Submit Exit Interview</button>
    </Card>
  );
}

// ─── F&F Settlement Tab ───────────────────────────────────────────────────────
function FnFTab() {
  const { data: fnf } = useQuery<FnFSettlement | null>({ queryKey: ['fnf-settlement'], queryFn: offboardingService.getFnFSettlement });
  const fmt = (n: number | null | undefined) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Full & Final Settlement</h3>
          {fnf && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_COLOR[fnf.status] || 'bg-gray-100'}`}>{fnf.status}</span>}
        </div>
        {fnf ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {([['Gratuity', fnf.gratuity], ['Leave Encashment', fnf.leave_encashment], ['Bonus', fnf.bonus], ['Deductions', fnf.deductions]] as [string, number | null | undefined][]).map(([l, v]) => (
                <div key={l}><p className="text-xs text-gray-400 uppercase tracking-wide">{l}</p><p className="font-semibold text-gray-800 mt-0.5">{fmt(v)}</p></div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between">
              <span className="font-semibold text-gray-700">Net Payable</span>
              <span className="font-bold text-lg text-primary-600">{fmt(fnf.net_payable)}</span>
            </div>
            {fnf.payment_date && <p className="text-xs text-gray-400">Payment Date: {format(parseISO(fnf.payment_date), 'dd MMM yyyy')}</p>}
            {fnf.remarks && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">{fnf.remarks}</p>}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <IndianRupee className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">F&F settlement has not been processed yet.</p>
            <p className="text-xs mt-1">Finance / HR will update this once your resignation is approved.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Checklist Tab ────────────────────────────────────────────────────────────
function OffboardingChecklistTab() {
  const qc = useQueryClient();
  const { data: checklist = [] } = useQuery({ queryKey: ['offboarding-checklist'], queryFn: offboardingService.getMyOffboardingChecklist });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => offboardingService.updateOffboardingItem(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['offboarding-checklist'] }),
    onError: () => toast.error('Failed to update'),
  });

  return (
    <div className="space-y-2">
      {checklist.map((item: { id: string; status: string; task: { task_title: string; category: string; is_mandatory: boolean } }) => {
        const done = item.status === 'COMPLETED';
        return (
          <div key={item.id} role="button" tabIndex={0}
            className={`bg-white rounded-2xl shadow-card border border-primary-50 p-3 flex items-center gap-3 cursor-pointer transition-all ${done ? 'bg-green-50 border-green-100' : 'hover:border-primary-200'}`}
            onClick={() => !done && updateMutation.mutate({ id: item.id, status: 'COMPLETED' })}
            onKeyDown={e => e.key === 'Enter' && !done && updateMutation.mutate({ id: item.id, status: 'COMPLETED' })}>
            {done
              ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              : <ClipboardList className="w-4 h-4 text-gray-300 shrink-0" />}
            <div className="flex-1">
              <p className={`text-sm font-medium ${done ? 'text-green-700 line-through' : 'text-gray-800'}`}>{item.task.task_title}</p>
              <p className="text-xs text-gray-400">{item.task.category}</p>
            </div>
          </div>
        );
      })}
      {checklist.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No offboarding tasks yet.</p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OffboardingPage() {
  const [tab, setTab] = useState<Tab>('resignation');

  return (
    <DashboardLayout title="">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-primary-600" /> Offboarding
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your resignation, exit interview and full & final settlement.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 flex-1 justify-center px-2 py-2 rounded-lg text-xs font-semibold transition-all ${tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{label}</span>
            </button>
          ))}
        </div>
        {tab === 'resignation' && <ResignationTab />}
        {tab === 'exit'        && <ExitInterviewTab />}
        {tab === 'fnf'         && <FnFTab />}
        {tab === 'checklist'   && <OffboardingChecklistTab />}
      </div>
    </DashboardLayout>
  );
}
