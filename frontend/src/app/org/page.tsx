'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, Users, Briefcase, Search, MapPin, ChevronRight, Plus, Check, X } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { orgService } from '@/services/org.service';
import { JobPosting, JobApplication } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'chart' | 'directory' | 'jobs';

const TABS = [
  { id: 'chart' as Tab,     label: 'Org Chart',      icon: Network },
  { id: 'directory' as Tab, label: 'Team Directory',  icon: Users },
  { id: 'jobs' as Tab,      label: 'Job Board',       icon: Briefcase },
];

type OrgNode = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  employee_code: string;
  manager_id: string | null;
  department: { id: string; department_name: string } | null;
  user: { email: string; role: { role_name: string } | null } | null;
};

// ─── Org Chart Tab ────────────────────────────────────────────────────────────
function OrgChartTab() {
  const { data: nodes = [] } = useQuery<OrgNode[]>({ queryKey: ['org-chart'], queryFn: orgService.getOrgChart });

  const roots = nodes.filter(n => !n.manager_id);
  const childrenOf = (id: string) => nodes.filter(n => n.manager_id === id);

  const NodeCard = ({ node, depth = 0 }: { node: OrgNode; depth?: number }) => {
    const children = childrenOf(node.id);
    return (
      <div className={`${depth > 0 ? 'ml-8 mt-2' : ''}`}>
        <div className="flex items-center gap-2">
          {depth > 0 && <div className="w-6 h-px bg-gray-200 shrink-0" />}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 hover:border-primary-300 hover:shadow-sm transition-all">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs shrink-0">
                {node.first_name?.[0]}{node.last_name?.[0]}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{node.first_name} {node.last_name}</p>
                <p className="text-xs text-gray-400 truncate">{node.department?.department_name} · {node.user?.role?.role_name?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
        {children.length > 0 && (
          <div className="ml-4 pl-4 border-l border-gray-200 mt-0">
            {children.map(c => <NodeCard key={c.id} node={c} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {roots.map(r => <NodeCard key={r.id} node={r} />)}
      {roots.length === 0 && (
        <div className="text-center py-10 text-gray-400"><Network className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">Org chart not available.</p></div>
      )}
    </div>
  );
}

// ─── Directory Tab ────────────────────────────────────────────────────────────
function DirectoryTab() {
  const [search, setSearch] = useState('');
  const { data: result } = useQuery({
    queryKey: ['org-directory', search],
    queryFn: () => orgService.getTeamDirectory({ search: search || undefined }),
    staleTime: 30000,
  });
  const employees: OrgNode[] = result?.employees || [];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input placeholder="Search by name or employee code…" value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-9" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {employees.map((e) => (
          <Card key={e.id} className="p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
              {e.first_name?.[0]}{e.last_name?.[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{e.first_name} {e.last_name}</p>
              <p className="text-xs text-gray-400 truncate">{e.department?.department_name}</p>
              <p className="text-xs text-primary-500">{e.employee_code}</p>
            </div>
          </Card>
        ))}
      </div>
      {employees.length === 0 && (
        <div className="text-center py-10 text-gray-400"><Users className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No employees found.</p></div>
      )}
    </div>
  );
}

// ─── Job Board Tab ────────────────────────────────────────────────────────────
function JobBoardTab() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const isHR = user?.role === 'HR' || user?.role === 'HR_MANAGER';
  const { data: jobs = [] } = useQuery<JobPosting[]>({ queryKey: ['org-jobs'], queryFn: () => orgService.getJobPostings() });
  const { data: myApps = [] } = useQuery<JobApplication[]>({ queryKey: ['org-my-apps'], queryFn: orgService.getMyApplications });
  const [selected, setSelected] = useState<JobPosting | null>(null);
  const [coverNote, setCoverNote] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', requirements: '', location: '', salaryRange: '', closingDate: '' });

  const appliedIds = new Set(myApps.map(a => a.job_posting.id));

  const applyMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => orgService.applyToJob(id, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['org-my-apps'] }); setSelected(null); toast.success('Application submitted!'); },
    onError: (e: { response?: { data?: { error?: string } } }) => toast.error(e?.response?.data?.error || 'Application failed'),
  });

  const createMutation = useMutation({
    mutationFn: (d: object) => orgService.createJobPosting(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['org-jobs'] }); setShowCreate(false); toast.success('Job posting created'); },
    onError: () => toast.error('Failed to create posting'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{jobs.length} open position{jobs.length !== 1 ? 's' : ''}</p>
        {isHR && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Post Job
          </button>
        )}
      </div>

      {showCreate && (
        <Card className="p-4 space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm">New Job Posting</h4>
          <input placeholder="Job title *" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} className="input-field" />
          <textarea placeholder="Job description" value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} rows={3} className="input-field resize-none" />
          <textarea placeholder="Requirements" value={createForm.requirements} onChange={e => setCreateForm({ ...createForm, requirements: e.target.value })} rows={2} className="input-field resize-none" />
          <div className="grid grid-cols-3 gap-3">
            <input placeholder="Location" value={createForm.location} onChange={e => setCreateForm({ ...createForm, location: e.target.value })} className="input-field" />
            <input placeholder="Salary range" value={createForm.salaryRange} onChange={e => setCreateForm({ ...createForm, salaryRange: e.target.value })} className="input-field" />
            <input type="date" value={createForm.closingDate} onChange={e => setCreateForm({ ...createForm, closingDate: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMutation.mutate({ ...createForm, isInternal: true })} disabled={!createForm.title || createMutation.isPending} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Check className="w-3.5 h-3.5" />Post</button>
            <button onClick={() => setShowCreate(false)} className="btn-secondary text-xs px-3 py-1.5"><X className="w-3.5 h-3.5 inline mr-1" />Cancel</button>
          </div>
        </Card>
      )}

      {jobs.map((job) => (
        <Card key={job.id} className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{job.title}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                {job.department && <span>{job.department.department_name}</span>}
                {job.location && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>}
                <span className="bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-full">{job.employment_type}</span>
                {job.salary_range && <span>{job.salary_range}</span>}
              </div>
              {job.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{job.description}</p>}
            </div>
            {appliedIds.has(job.id) ? (
              <span className="ml-3 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium shrink-0">Applied</span>
            ) : (
              <button onClick={() => setSelected(job)} className="ml-3 btn-primary text-xs px-3 py-1.5 shrink-0 flex items-center gap-1">
                Apply <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </Card>
      ))}
      {jobs.length === 0 && !showCreate && (
        <div className="text-center py-10 text-gray-400"><Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" /><p className="text-sm">No open positions.</p></div>
      )}

      {/* Apply Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Apply: {selected.title}</h3>
            <p className="text-xs text-gray-400 mb-4">{selected.department?.department_name}</p>
            <textarea placeholder="Cover note (optional)" value={coverNote} onChange={e => setCoverNote(e.target.value)} rows={4}
              className="input-field resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => applyMutation.mutate({ id: selected.id, note: coverNote })} disabled={applyMutation.isPending}
                className="btn-primary px-4 py-2 text-sm flex-1">Submit Application</button>
              <button onClick={() => setSelected(null)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OrgPage() {
  const [tab, setTab] = useState<Tab>('directory');

  return (
    <DashboardLayout title="">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="w-5 h-5 text-primary-600" /> My Organization
          </h1>
          <p className="text-sm text-gray-500 mt-1">Explore your org chart, find team members and apply for internal jobs.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-semibold transition-all ${tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
        {tab === 'chart'     && <OrgChartTab />}
        {tab === 'directory' && <DirectoryTab />}
        {tab === 'jobs'      && <JobBoardTab />}
      </div>
    </DashboardLayout>
  );
}
