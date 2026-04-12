'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target, Plus, Check, X, Pencil, Star, Users, MessageSquare, Zap, TrendingUp,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { pmsService } from '@/services/pms.service';
import {
  PerformanceGoal, SelfAssessment, Feedback360, EmployeeSkill, SkillDevelopmentPlan,
} from '@/types';
import toast from 'react-hot-toast';

type Tab = 'goals' | 'assessment' | 'feedback' | 'skills';

const TABS = [
  { id: 'goals' as Tab,      label: 'Goals & OKRs',    icon: Target },
  { id: 'assessment' as Tab, label: 'Self Assessment',  icon: Star },
  { id: 'feedback' as Tab,   label: '360° Feedback',   icon: MessageSquare },
  { id: 'skills' as Tab,     label: 'Skills',           icon: Zap },
];

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  DRAFT: 'bg-yellow-50 text-yellow-700',
  SUBMITTED: 'bg-green-50 text-green-700',
  IN_PROGRESS: 'bg-orange-50 text-orange-700',
  ON_HOLD: 'bg-gray-100 text-gray-500',
};

// ─── Goals Tab ────────────────────────────────────────────────────────────────
function GoalsTab() {
  const qc = useQueryClient();
  const { data: goals = [] } = useQuery<PerformanceGoal[]>({ queryKey: ['pms-goals'], queryFn: () => pmsService.getMyGoals() });
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<PerformanceGoal | null>(null);
  const [form, setForm] = useState({ title: '', description: '', goalType: 'INDIVIDUAL', metricType: 'OKR', targetValue: '', reviewPeriod: '', dueDate: '' });

  const createMutation = useMutation({
    mutationFn: (d: object) => pmsService.createGoal(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pms-goals'] }); setShowForm(false); toast.success('Goal created'); },
    onError: () => toast.error('Failed to create goal'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => pmsService.updateGoal(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pms-goals'] }); setEditGoal(null); toast.success('Goal updated'); },
    onError: () => toast.error('Failed to update goal'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{goals.length} goal{goals.length !== 1 ? 's' : ''} total</p>
        <button onClick={() => setShowForm(true)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Goal
        </button>
      </div>

      {showForm && (
        <Card className="p-4 space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm">New Goal</h4>
          <input placeholder="Goal title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="input-field resize-none" />
          <div className="grid grid-cols-3 gap-3">
            <select value={form.goalType} onChange={e => setForm({ ...form, goalType: e.target.value })} className="input-field">
              {['INDIVIDUAL', 'TEAM', 'DEPARTMENTAL'].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={form.metricType} onChange={e => setForm({ ...form, metricType: e.target.value })} className="input-field">
              {['OKR', 'KPI', 'SMART'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="Target value" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Review period (e.g. Q1-FY2026)" value={form.reviewPeriod} onChange={e => setForm({ ...form, reviewPeriod: e.target.value })} className="input-field" />
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMutation.mutate(form)} disabled={!form.title || createMutation.isPending} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Create
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-xs px-3 py-1.5"><X className="w-3.5 h-3.5 inline mr-1" />Cancel</button>
          </div>
        </Card>
      )}

      {goals.map((g) => (
        <Card key={g.id} className="p-4">
          {editGoal?.id === g.id ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Achieved value" defaultValue={g.achieved_value || ''} id={`av-${g.id}`} className="input-field" />
                <input type="number" min="0" max="100" placeholder="Progress %" defaultValue={g.progress_pct} id={`pp-${g.id}`} className="input-field" />
              </div>
              <select defaultValue={g.status} id={`st-${g.id}`} className="input-field">
                {['ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => <option key={s}>{s}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => updateMutation.mutate({ id: g.id, data: {
                  achievedValue: (document.getElementById(`av-${g.id}`) as HTMLInputElement)?.value,
                  progressPct: +(document.getElementById(`pp-${g.id}`) as HTMLInputElement)?.value,
                  status: (document.getElementById(`st-${g.id}`) as HTMLSelectElement)?.value,
                }})} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Check className="w-3.5 h-3.5" />Save</button>
                <button onClick={() => setEditGoal(null)} className="btn-secondary text-xs px-3 py-1.5"><X className="w-3.5 h-3.5 inline mr-1" />Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{g.title}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${STATUS_COLOR[g.status] || 'bg-gray-100 text-gray-500'}`}>{g.status}</span>
                    <span className="text-[10px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-full">{g.metric_type}</span>
                  </div>
                  {g.description && <p className="text-xs text-gray-500 mt-1">{g.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                    {g.review_period && <span>Period: {g.review_period}</span>}
                    {g.target_value && <span>Target: {g.target_value}</span>}
                    {g.achieved_value && <span className="text-green-600">Achieved: {g.achieved_value}</span>}
                  </div>
                </div>
                <button onClick={() => setEditGoal(g)} className="ml-3 text-gray-300 hover:text-primary-600 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Progress</span>
                  <span className="text-xs font-semibold text-gray-600">{g.progress_pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${g.progress_pct}%` }} />
                </div>
              </div>
            </>
          )}
        </Card>
      ))}
      {goals.length === 0 && !showForm && (
        <div className="text-center py-10 text-gray-400"><Target className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No goals yet. Add your first goal.</p></div>
      )}
    </div>
  );
}

// ─── Assessment Tab ───────────────────────────────────────────────────────────
function AssessmentTab() {
  const qc = useQueryClient();
  const { data: assessments = [] } = useQuery<SelfAssessment[]>({ queryKey: ['pms-assessments'], queryFn: pmsService.getMySelfAssessments });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reviewPeriod: '', strengths: '', improvements: '', achievements: '', ratingSelf: '', overallComment: '', submit: false });

  const mutation = useMutation({
    mutationFn: (d: object) => pmsService.upsertSelfAssessment(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pms-assessments'] }); setShowForm(false); toast.success('Assessment saved'); },
    onError: (e: { response?: { data?: { error?: string } } }) => toast.error(e?.response?.data?.error || 'Failed to save'),
  });

  const StarRating = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(String(n))}
          className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors ${+value >= n ? 'bg-amber-400 text-white' : 'bg-gray-100 text-gray-400 hover:bg-amber-100'}`}>
          {n}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> New Assessment
        </button>
      </div>

      {showForm && (
        <Card className="p-4 space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm">Self Assessment</h4>
          <input placeholder="Review period (e.g. Q1-FY2026) *" value={form.reviewPeriod} onChange={e => setForm({ ...form, reviewPeriod: e.target.value })} className="input-field" />
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Self Rating</label>
            <StarRating value={form.ratingSelf} onChange={v => setForm({ ...form, ratingSelf: v })} />
          </div>
          <textarea placeholder="Key achievements this period" value={form.achievements} onChange={e => setForm({ ...form, achievements: e.target.value })} rows={2} className="input-field resize-none" />
          <textarea placeholder="Strengths demonstrated" value={form.strengths} onChange={e => setForm({ ...form, strengths: e.target.value })} rows={2} className="input-field resize-none" />
          <textarea placeholder="Areas for improvement" value={form.improvements} onChange={e => setForm({ ...form, improvements: e.target.value })} rows={2} className="input-field resize-none" />
          <textarea placeholder="Overall comments" value={form.overallComment} onChange={e => setForm({ ...form, overallComment: e.target.value })} rows={2} className="input-field resize-none" />
          <div className="flex gap-2">
            <button onClick={() => mutation.mutate({ ...form, ratingSelf: form.ratingSelf ? +form.ratingSelf : undefined, submit: false })} disabled={!form.reviewPeriod || mutation.isPending} className="btn-secondary text-xs px-3 py-1.5">Save Draft</button>
            <button onClick={() => mutation.mutate({ ...form, ratingSelf: form.ratingSelf ? +form.ratingSelf : undefined, submit: true })} disabled={!form.reviewPeriod || mutation.isPending} className="btn-primary text-xs px-3 py-1.5">Submit</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary text-xs px-3 py-1.5 ml-auto"><X className="w-3.5 h-3.5 inline mr-1" />Cancel</button>
          </div>
        </Card>
      )}

      {assessments.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800 text-sm">{a.review_period}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${STATUS_COLOR[a.status]}`}>{a.status}</span>
            </div>
            {a.rating_self && <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-xs font-semibold text-gray-600">{a.rating_self}/5</span></div>}
          </div>
          {a.achievements && <p className="text-xs text-gray-600 mb-1"><span className="font-medium">Achievements:</span> {a.achievements}</p>}
          {a.strengths && <p className="text-xs text-gray-600 mb-1"><span className="font-medium">Strengths:</span> {a.strengths}</p>}
          {a.manager_review && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-1">Manager Review</p>
              {a.manager_review.final_rating && <p className="text-xs text-gray-600">Final Rating: <strong>{a.manager_review.final_rating}/5</strong></p>}
              {a.manager_review.overall_comment && <p className="text-xs text-gray-600 mt-1">{a.manager_review.overall_comment}</p>}
            </div>
          )}
        </Card>
      ))}
      {assessments.length === 0 && !showForm && (
        <div className="text-center py-10 text-gray-400"><Star className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No assessments yet.</p></div>
      )}
    </div>
  );
}

// ─── Feedback Tab ─────────────────────────────────────────────────────────────
function FeedbackTab() {
  const { data: feedback = [] } = useQuery<Feedback360[]>({ queryKey: ['pms-feedback'], queryFn: pmsService.getFeedbackReceived });

  return (
    <div className="space-y-3">
      {feedback.map((f) => (
        <Card key={f.id} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{f.relationship}</span>
              <span className="text-xs text-gray-400">{f.review_period}</span>
              {f.is_anonymous && <span className="text-xs text-gray-300">Anonymous</span>}
            </div>
            {f.rating && <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-xs font-semibold">{f.rating}/5</span></div>}
          </div>
          {!f.is_anonymous && f.giver && <p className="text-xs text-gray-500 mb-2">From: {f.giver.first_name} {f.giver.last_name}</p>}
          {f.strengths && <p className="text-xs text-gray-600"><span className="font-medium">Strengths:</span> {f.strengths}</p>}
          {f.improvements && <p className="text-xs text-gray-600 mt-1"><span className="font-medium">Improvements:</span> {f.improvements}</p>}
        </Card>
      ))}
      {feedback.length === 0 && (
        <div className="text-center py-10 text-gray-400"><MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No feedback received yet.</p></div>
      )}
    </div>
  );
}

// ─── Skills Tab ───────────────────────────────────────────────────────────────
function SkillsTab() {
  const qc = useQueryClient();
  const { data: skills = [] } = useQuery<EmployeeSkill[]>({ queryKey: ['pms-skills'], queryFn: pmsService.getSkills });
  const { data: plans = [] } = useQuery<SkillDevelopmentPlan[]>({ queryKey: ['pms-skill-plans'], queryFn: pmsService.getSkillPlans });
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [skillForm, setSkillForm] = useState({ skillName: '', category: 'TECHNICAL', proficiency: 'BEGINNER' });
  const [planForm, setPlanForm] = useState({ skillName: '', currentLevel: '', targetLevel: '', actionItems: '', resources: '', targetDate: '' });

  const addSkill = useMutation({
    mutationFn: (d: object) => pmsService.addSkill(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pms-skills'] }); setShowSkillForm(false); toast.success('Skill added'); },
  });
  const delSkill = useMutation({
    mutationFn: (id: string) => pmsService.deleteSkill(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pms-skills'] }),
  });
  const addPlan = useMutation({
    mutationFn: (d: object) => pmsService.createSkillPlan(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pms-skill-plans'] }); setShowPlanForm(false); toast.success('Plan created'); },
  });

  const PROFICIENCY_COLOR: Record<string, string> = {
    BEGINNER: 'bg-gray-100 text-gray-500', INTERMEDIATE: 'bg-blue-50 text-blue-700',
    ADVANCED: 'bg-purple-50 text-purple-700', EXPERT: 'bg-green-50 text-green-700',
  };

  return (
    <div className="space-y-6">
      {/* Skills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm">My Skills</h3>
          <button onClick={() => setShowSkillForm(true)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Skill</button>
        </div>
        {showSkillForm && (
          <Card className="p-4 space-y-3 mb-3">
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Skill name *" value={skillForm.skillName} onChange={e => setSkillForm({ ...skillForm, skillName: e.target.value })} className="input-field" />
              <select value={skillForm.category} onChange={e => setSkillForm({ ...skillForm, category: e.target.value })} className="input-field">
                {['TECHNICAL', 'SOFT', 'LEADERSHIP', 'DOMAIN'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={skillForm.proficiency} onChange={e => setSkillForm({ ...skillForm, proficiency: e.target.value })} className="input-field">
                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => addSkill.mutate(skillForm)} disabled={!skillForm.skillName || addSkill.isPending} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Check className="w-3.5 h-3.5" />Add</button>
              <button onClick={() => setShowSkillForm(false)} className="btn-secondary text-xs px-3 py-1.5"><X className="w-3.5 h-3.5 inline mr-1" />Cancel</button>
            </div>
          </Card>
        )}
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs">
              <span className="font-medium text-gray-700">{s.skill_name}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-semibold text-[10px] ${PROFICIENCY_COLOR[s.proficiency] || 'bg-gray-100 text-gray-500'}`}>{s.proficiency}</span>
              <button onClick={() => delSkill.mutate(s.id)} className="text-gray-300 hover:text-red-400 transition-colors ml-0.5"><X className="w-3 h-3" /></button>
            </div>
          ))}
          {skills.length === 0 && !showSkillForm && <p className="text-sm text-gray-400">No skills added yet.</p>}
        </div>
      </div>

      {/* Development Plans */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-primary-600" />Skill Development Plans</h3>
          <button onClick={() => setShowPlanForm(true)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Plan</button>
        </div>
        {showPlanForm && (
          <Card className="p-4 space-y-3 mb-3">
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Skill name *" value={planForm.skillName} onChange={e => setPlanForm({ ...planForm, skillName: e.target.value })} className="input-field" />
              <input placeholder="Current level" value={planForm.currentLevel} onChange={e => setPlanForm({ ...planForm, currentLevel: e.target.value })} className="input-field" />
              <input placeholder="Target level" value={planForm.targetLevel} onChange={e => setPlanForm({ ...planForm, targetLevel: e.target.value })} className="input-field" />
            </div>
            <textarea placeholder="Action items" value={planForm.actionItems} onChange={e => setPlanForm({ ...planForm, actionItems: e.target.value })} rows={2} className="input-field resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Resources / links" value={planForm.resources} onChange={e => setPlanForm({ ...planForm, resources: e.target.value })} className="input-field" />
              <input type="date" value={planForm.targetDate} onChange={e => setPlanForm({ ...planForm, targetDate: e.target.value })} className="input-field" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => addPlan.mutate(planForm)} disabled={!planForm.skillName || addPlan.isPending} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Check className="w-3.5 h-3.5" />Create</button>
              <button onClick={() => setShowPlanForm(false)} className="btn-secondary text-xs px-3 py-1.5"><X className="w-3.5 h-3.5 inline mr-1" />Cancel</button>
            </div>
          </Card>
        )}
        <div className="space-y-2">
          {plans.map((p) => (
            <Card key={p.id} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 text-sm">{p.skill_name}</p>
                <p className="text-xs text-gray-400">{p.current_level} → {p.target_level}</p>
                {p.target_date && <p className="text-xs text-gray-400">Due {new Date(p.target_date).toLocaleDateString()}</p>}
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${STATUS_COLOR[p.status] || 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
            </Card>
          ))}
          {plans.length === 0 && !showPlanForm && <p className="text-sm text-gray-400">No development plans yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PMSPage() {
  const [tab, setTab] = useState<Tab>('goals');

  return (
    <DashboardLayout title="">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-600" /> Performance Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track goals, assessments, 360° feedback and skill development.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all ${tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
        {tab === 'goals'      && <GoalsTab />}
        {tab === 'assessment' && <AssessmentTab />}
        {tab === 'feedback'   && <FeedbackTab />}
        {tab === 'skills'     && <SkillsTab />}
      </div>
    </DashboardLayout>
  );
}
