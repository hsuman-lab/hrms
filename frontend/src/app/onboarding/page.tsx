'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, CheckCircle2, Circle, Shield, Star } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { onboardingService } from '@/services/onboarding.service';
import {
  OnboardingChecklist, PolicyAcknowledgement, OnboardingExperience,
} from '@/types';
import toast from 'react-hot-toast';

type Tab = 'checklist' | 'policies' | 'experience';

const TABS = [
  { id: 'checklist' as Tab,  label: 'Onboarding Tasks', icon: ClipboardList },
  { id: 'policies' as Tab,   label: 'Policy Acknowledgement', icon: Shield },
  { id: 'experience' as Tab, label: 'Rate Your Onboarding', icon: Star },
];

const POLICIES = [
  { name: 'Code of Business Conduct', version: '2.0' },
  { name: 'POSH Policy', version: '1.5' },
  { name: 'IT Security Policy', version: '3.0' },
  { name: 'Leave & Attendance Policy', version: '2.1' },
  { name: 'Data Privacy Policy', version: '1.0' },
];

// ─── Checklist Tab ────────────────────────────────────────────────────────────
function ChecklistTab() {
  const qc = useQueryClient();
  const { data: checklist = [] } = useQuery<OnboardingChecklist[]>({
    queryKey: ['onboarding-checklist'],
    queryFn: onboardingService.getMyChecklist,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => onboardingService.updateChecklistItem(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding-checklist'] }),
    onError: () => toast.error('Failed to update task'),
  });

  const grouped = checklist.reduce<Record<string, OnboardingChecklist[]>>((acc, item) => {
    const cat = item.task.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const completed = checklist.filter(c => c.status === 'COMPLETED').length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-5">
      {total > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Onboarding Progress</p>
            <span className="text-sm font-bold text-primary-600">{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{completed} of {total} tasks completed</p>
        </Card>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{cat}</h3>
          <div className="space-y-2">
            {items.map((item) => {
              const done = item.status === 'COMPLETED';
              return (
                <div key={item.id} role="button" tabIndex={0}
                  className={`bg-white rounded-2xl shadow-card border border-primary-50 p-3 flex items-center gap-3 cursor-pointer transition-all ${done ? 'bg-green-50 border-green-100' : 'hover:border-primary-200'}`}
                  onClick={() => !done && updateMutation.mutate({ id: item.id, status: 'COMPLETED' })}
                  onKeyDown={e => e.key === 'Enter' && !done && updateMutation.mutate({ id: item.id, status: 'COMPLETED' })}>
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    : <Circle className="w-4 h-4 text-gray-300 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? 'text-green-700 line-through' : 'text-gray-800'}`}>{item.task.task_title}</p>
                    {item.task.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.task.description}</p>}
                    {item.task.is_mandatory && <span className="text-[10px] text-red-500 font-semibold">REQUIRED</span>}
                  </div>
                  {done && <span className="text-xs text-green-600 font-medium shrink-0">Done</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {total === 0 && (
        <div className="text-center py-10 text-gray-400">
          <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No onboarding tasks assigned yet.</p>
          <p className="text-xs mt-1">Contact HR to set up your onboarding checklist.</p>
        </div>
      )}
    </div>
  );
}

// ─── Policies Tab ─────────────────────────────────────────────────────────────
function PoliciesTab() {
  const qc = useQueryClient();
  const { data: acknowledged = [] } = useQuery<PolicyAcknowledgement[]>({
    queryKey: ['onboarding-policies'],
    queryFn: onboardingService.getPolicies,
  });

  const ackMutation = useMutation({
    mutationFn: (data: object) => onboardingService.acknowledgePolicy(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['onboarding-policies'] }); toast.success('Policy acknowledged'); },
    onError: () => toast.error('Failed to acknowledge'),
  });

  const ackedMap = new Set(acknowledged.map(a => `${a.policy_name}:${a.policy_version}`));

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Please read and acknowledge all company policies.</p>
      {POLICIES.map((p) => {
        const key = `${p.name}:${p.version}`;
        const done = ackedMap.has(key);
        return (
          <Card key={key} className={`p-4 flex items-center justify-between ${done ? 'bg-green-50 border-green-100' : ''}`}>
            <div className="flex items-center gap-3">
              {done
                ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                : <Shield className="w-5 h-5 text-gray-300 shrink-0" />}
              <div>
                <p className="font-medium text-gray-800 text-sm">{p.name}</p>
                <p className="text-xs text-gray-400">v{p.version}</p>
              </div>
            </div>
            {done ? (
              <span className="text-xs text-green-600 font-semibold">Acknowledged</span>
            ) : (
              <button onClick={() => ackMutation.mutate({ policyName: p.name, policyVersion: p.version })}
                disabled={ackMutation.isPending}
                className="btn-primary text-xs px-3 py-1.5">
                I Acknowledge
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Experience Tab ───────────────────────────────────────────────────────────
function ExperienceTab() {
  const qc = useQueryClient();
  const { data: exp } = useQuery<OnboardingExperience | null>({
    queryKey: ['onboarding-experience'],
    queryFn: onboardingService.getExperience,
  });
  const [form, setForm] = useState({ overallRating: 0, buddyRating: 0, processRating: 0, feedback: '' });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: (d: object) => onboardingService.submitExperience(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['onboarding-experience'] }); setSubmitted(true); toast.success('Thank you for your feedback!'); },
    onError: () => toast.error('Failed to submit'),
  });

  const StarPicker = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${value >= n ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400 hover:bg-amber-100'}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  if (exp?.submitted_at && !submitted) {
    return (
      <Card className="p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-800">Feedback Already Submitted</p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[['Overall', exp.overall_rating], ['Buddy', exp.buddy_rating], ['Process', exp.process_rating]].map(([l, v]) => (
            <div key={String(l)} className="text-center">
              <p className="text-2xl font-bold text-primary-600">{v || '—'}</p>
              <p className="text-xs text-gray-400">{String(l)}</p>
            </div>
          ))}
        </div>
        {exp.feedback && <p className="mt-4 text-sm text-gray-600 italic">"{exp.feedback}"</p>}
      </Card>
    );
  }

  return (
    <Card className="p-5 space-y-5">
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Rate Your Onboarding Experience</h3>
        <p className="text-xs text-gray-400">Your feedback helps us improve the process for future employees.</p>
      </div>
      <div className="space-y-4">
        <StarPicker label="Overall Experience" value={form.overallRating} onChange={v => setForm({ ...form, overallRating: v })} />
        <StarPicker label="Buddy / Mentor Support" value={form.buddyRating} onChange={v => setForm({ ...form, buddyRating: v })} />
        <StarPicker label="Onboarding Process" value={form.processRating} onChange={v => setForm({ ...form, processRating: v })} />
      </div>
      <textarea placeholder="Any additional feedback or suggestions?" value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} rows={3} className="input-field resize-none" />
      <button onClick={() => mutation.mutate(form)} disabled={!form.overallRating || mutation.isPending}
        className="btn-primary w-full py-2.5 text-sm">
        Submit Feedback
      </button>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [tab, setTab] = useState<Tab>('checklist');

  return (
    <DashboardLayout title="">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary-600" /> Onboarding
          </h1>
          <p className="text-sm text-gray-500 mt-1">Complete your onboarding tasks, acknowledge policies and share your experience.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 flex-1 justify-center px-2 py-2 rounded-lg text-xs font-semibold transition-all ${tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{label}</span>
            </button>
          ))}
        </div>
        {tab === 'checklist'  && <ChecklistTab />}
        {tab === 'policies'   && <PoliciesTab />}
        {tab === 'experience' && <ExperienceTab />}
      </div>
    </DashboardLayout>
  );
}
