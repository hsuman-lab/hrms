'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CheckCircle2, Clock, AlertTriangle, Play, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { learningService } from '@/services/learning.service';
import { CourseEnrollment, EnrollmentStatus } from '@/types';
import { format, parseISO, isPast } from 'date-fns';
import toast from 'react-hot-toast';

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; color: string; bg: string }> = {
  NOT_STARTED: { label: 'Not Started', color: 'text-gray-500',   bg: 'bg-gray-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-cyan-700',   bg: 'bg-cyan-50' },
  COMPLETED:   { label: 'Completed',   color: 'text-green-700',  bg: 'bg-green-50' },
};

const CATEGORY_LABEL: Record<string, string> = {
  COMPLIANCE:  'Compliance',
  IT_SECURITY: 'IT Security',
  GENERAL:     'General',
};

// ─── Progress slider modal ──────────────────────────────────────────────────
function ProgressModal({
  enrollment,
  onClose,
}: {
  enrollment: CourseEnrollment;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [pct, setPct] = useState(enrollment.progress_pct);

  const mutation = useMutation({
    mutationFn: (val: number) => learningService.updateProgress(enrollment.course_id, val),
    onSuccess: () => {
      toast.success(pct === 100 ? 'Course completed!' : 'Progress saved');
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] });
      onClose();
    },
    onError: () => toast.error('Failed to update progress'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-1">{enrollment.course.title}</h3>
        <p className="text-sm text-gray-500 mb-6">{enrollment.course.description}</p>

        <div className="mb-2 flex justify-between text-sm font-medium text-gray-700">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={pct}
          onChange={(e) => setPct(Number(e.target.value))}
          className="w-full accent-primary-600 cursor-pointer"
        />

        {/* Quick shortcuts */}
        <div className="flex gap-2 mt-3">
          {[25, 50, 75, 100].map((v) => (
            <button
              key={v}
              onClick={() => setPct(v)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                pct === v
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v}%
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate(pct)}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold disabled:opacity-60"
          >
            {mutation.isPending ? 'Saving…' : 'Save Progress'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Course card ─────────────────────────────────────────────────────────────
function CourseCard({ enrollment, onUpdate }: { enrollment: CourseEnrollment; onUpdate: () => void }) {
  const cfg = STATUS_CONFIG[enrollment.status as EnrollmentStatus] ?? STATUS_CONFIG.NOT_STARTED;
  const isOverdue = enrollment.due_date && !enrollment.completed_at && isPast(parseISO(enrollment.due_date));

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-4 transition-all hover:shadow-md ${
      enrollment.course.is_mandatory ? 'border-l-4 border-l-red-400' : 'border-gray-100'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {enrollment.course.is_mandatory && (
              <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Mandatory</span>
            )}
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {CATEGORY_LABEL[enrollment.course.category] ?? enrollment.course.category}
            </span>
            {isOverdue && (
              <span className="text-xs font-bold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Overdue
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{enrollment.course.title}</h3>
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{enrollment.progress_pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              enrollment.progress_pct === 100 ? 'bg-green-500' : 'bg-primary-500'
            }`}
            style={{ width: `${enrollment.progress_pct}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400 space-y-0.5">
          {enrollment.course.duration_mins && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {enrollment.course.duration_mins} min
            </div>
          )}
          {enrollment.due_date && (
            <div className={isOverdue ? 'text-orange-500 font-medium' : ''}>
              Due: {format(parseISO(enrollment.due_date), 'MMM d, yyyy')}
            </div>
          )}
          {enrollment.completed_at && (
            <div className="text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Completed {format(parseISO(enrollment.completed_at), 'MMM d, yyyy')}
            </div>
          )}
        </div>

        {enrollment.status !== 'COMPLETED' && (
          <button
            onClick={onUpdate}
            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <Play className="w-3 h-3" />
            {enrollment.status === 'NOT_STARTED' ? 'Start' : 'Continue'}
          </button>
        )}
        {enrollment.status === 'COMPLETED' && (
          <button
            onClick={onUpdate}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" /> Review
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function LearningPage() {
  const [selected, setSelected] = useState<CourseEnrollment | null>(null);
  const [filter, setFilter] = useState<'ALL' | EnrollmentStatus>('ALL');

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: learningService.getMyEnrollments,
  });

  const mandatory    = enrollments.filter((e) => e.course.is_mandatory);
  const notCompleted = enrollments.filter((e) => e.status !== 'COMPLETED').length;
  const completed    = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const overdue      = enrollments.filter(
    (e) => e.due_date && !e.completed_at && isPast(parseISO(e.due_date))
  ).length;

  const filtered = filter === 'ALL' ? enrollments : enrollments.filter((e) => e.status === filter);

  return (
    <DashboardLayout title="Learning & Development" subtitle="Complete your assigned courses and track progress">
      {selected && <ProgressModal enrollment={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Courses"   value={enrollments.length} subtitle="Assigned to you"   icon={BookOpen}      color="primary" />
          <StatCard title="Completed"       value={completed}          subtitle="Finished"           icon={CheckCircle2}  color="green"   />
          <StatCard title="Pending"         value={notCompleted}       subtitle="To complete"        icon={Play}          color="orange"  />
          <StatCard title="Overdue"         value={overdue}            subtitle="Past due date"      icon={AlertTriangle} color="red"     />
        </div>

        {/* Mandatory compliance banner */}
        {mandatory.some((e) => e.status !== 'COMPLETED') && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 text-sm">Mandatory courses pending</p>
              <p className="text-xs text-red-600 mt-0.5">
                You have {mandatory.filter((e) => e.status !== 'COMPLETED').length} mandatory compliance course(s) that must be completed.
                These include POSH, Code of Business Conduct, and IT Security Awareness.
              </p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'ALL' ? 'All' : STATUS_CONFIG[f].label}
              <span className="ml-1.5 text-xs opacity-70">
                {f === 'ALL' ? enrollments.length : enrollments.filter((e) => e.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {/* Course grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <div className="py-16 text-center text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No courses found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                enrollment={enrollment}
                onUpdate={() => setSelected(enrollment)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
