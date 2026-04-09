'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, Plus, Users, CheckCircle2, AlertTriangle, Trash2,
  ChevronDown, ChevronUp, BarChart3, Shield,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, StatCard } from '@/components/ui/Card';
import { learningService } from '@/services/learning.service';
import { Course, CourseEnrollment } from '@/types';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const CATEGORIES = ['COMPLIANCE', 'IT_SECURITY', 'GENERAL', 'LEADERSHIP', 'TECHNICAL'];
const CATEGORY_LABEL: Record<string, string> = {
  COMPLIANCE: 'Compliance', IT_SECURITY: 'IT Security', GENERAL: 'General',
  LEADERSHIP: 'Leadership', TECHNICAL: 'Technical',
};

// ─── Add Course Modal ────────────────────────────────────────────────────────
function AddCourseModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', category: 'GENERAL',
    is_mandatory: false, duration_mins: '',
  });

  const mutation = useMutation({
    mutationFn: () => learningService.createCourse({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      category: form.category,
      is_mandatory: form.is_mandatory,
      duration_mins: form.duration_mins ? Number(form.duration_mins) : undefined,
    }),
    onSuccess: () => {
      toast.success('Course created');
      queryClient.invalidateQueries({ queryKey: ['hr-courses'] });
      queryClient.invalidateQueries({ queryKey: ['learning-stats'] });
      onClose();
    },
    onError: () => toast.error('Failed to create course'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-5">Add New Course</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Course Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. POSH — Prevention of Sexual Harassment"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c] ?? c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                value={form.duration_mins}
                onChange={(e) => setForm({ ...form, duration_mins: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.is_mandatory}
              onChange={(e) => setForm({ ...form, is_mandatory: e.target.checked })}
              className="w-4 h-4 accent-primary-600 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-800">Mark as Mandatory</span>
              <p className="text-xs text-gray-400">Course will be highlighted and required for all employees</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!form.title.trim() || mutation.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold disabled:opacity-60"
          >
            {mutation.isPending ? 'Creating…' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Enroll Modal ────────────────────────────────────────────────────────────
function EnrollModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [dueDate, setDueDate] = useState('');

  const mutation = useMutation({
    mutationFn: () => learningService.enrollAll(course.id, dueDate || undefined),
    onSuccess: () => {
      toast.success('All active employees enrolled');
      queryClient.invalidateQueries({ queryKey: ['hr-courses'] });
      queryClient.invalidateQueries({ queryKey: ['learning-stats'] });
      onClose();
    },
    onError: () => toast.error('Enrollment failed'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="font-bold text-gray-900 text-lg mb-1">Enroll All Employees</h3>
        <p className="text-sm text-gray-500 mb-5">Enroll all active employees in <strong>{course.title}</strong>.</p>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Due Date (optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold disabled:opacity-60"
          >
            {mutation.isPending ? 'Enrolling…' : 'Enroll All'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Course row with expandable enrollment list ───────────────────────────
function CourseRow({ course }: { course: Course }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [enrollModal, setEnrollModal] = useState(false);

  const { data: enrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['course-enrollments', course.id],
    queryFn: () => learningService.getCourseEnrollments(course.id),
    enabled: expanded,
  });

  const deleteMutation = useMutation({
    mutationFn: () => learningService.deleteCourse(course.id),
    onSuccess: () => {
      toast.success('Course deleted');
      queryClient.invalidateQueries({ queryKey: ['hr-courses'] });
      queryClient.invalidateQueries({ queryKey: ['learning-stats'] });
    },
    onError: () => toast.error('Failed to delete course'),
  });

  const completedCount = (enrollments ?? []).filter((e: CourseEnrollment) => e.status === 'COMPLETED').length;

  return (
    <>
      {enrollModal && <EnrollModal course={course} onClose={() => setEnrollModal(false)} />}

      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        {/* Course header row */}
        <div className="flex items-center gap-4 px-5 py-4 bg-white hover:bg-gray-50/60 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{course.title}</span>
              {course.is_mandatory && (
                <span className="text-xs font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Mandatory
                </span>
              )}
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {CATEGORY_LABEL[course.category] ?? course.category}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">{course.description}</p>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-xs text-gray-500 shrink-0">
            {course.duration_mins && <span>{course.duration_mins} min</span>}
            <span>{course._count?.enrollments ?? 0} enrolled</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setEnrollModal(true)}
              className="flex items-center gap-1 text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Users className="w-3.5 h-3.5" /> Enroll All
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Enrollment details */}
        {expanded && (
          <div className="border-t border-gray-100 bg-gray-50/40 px-5 py-4">
            {loadingEnrollments ? (
              <div className="flex gap-3">
                {[1,2,3].map((i) => <div key={i} className="h-8 w-32 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : !enrollments?.length ? (
              <p className="text-xs text-gray-400">No enrollments yet. Click "Enroll All" to assign to all employees.</p>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-3">
                  {completedCount} / {enrollments.length} completed
                  {' '}· {Math.round((completedCount / enrollments.length) * 100)}% completion rate
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {enrollments.map((e: CourseEnrollment) => (
                    <div key={e.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-gray-100">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                        {e.employee?.first_name?.[0]}{e.employee?.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">
                          {e.employee?.first_name} {e.employee?.last_name}
                        </p>
                        <p className="text-xs text-gray-400">{e.employee?.department?.department_name}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-xs font-semibold ${
                          e.status === 'COMPLETED' ? 'text-green-600' :
                          e.status === 'IN_PROGRESS' ? 'text-cyan-600' : 'text-gray-400'
                        }`}>{e.progress_pct}%</span>
                        {e.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 mx-auto" />}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HRLearningPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [filterMandatory, setFilterMandatory] = useState<'ALL' | 'MANDATORY' | 'OPTIONAL'>('ALL');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['hr-courses'],
    queryFn: learningService.getCourses,
  });

  const { data: stats } = useQuery({
    queryKey: ['learning-stats'],
    queryFn: learningService.getStats,
  });

  const filtered = courses.filter((c) =>
    filterMandatory === 'ALL' ? true :
    filterMandatory === 'MANDATORY' ? c.is_mandatory : !c.is_mandatory
  );

  const completionRate = stats && stats.totalEnrollments > 0
    ? Math.round((stats.completed / stats.totalEnrollments) * 100)
    : 0;

  return (
    <DashboardLayout title="L&D Management" subtitle="Manage courses and track employee learning compliance">
      {showAdd && <AddCourseModal onClose={() => setShowAdd(false)} />}

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Courses"    value={stats?.totalCourses ?? 0}       subtitle="Active catalogue"      icon={BookOpen}      color="primary" />
          <StatCard title="Mandatory"        value={stats?.mandatoryCourses ?? 0}   subtitle="Compliance required"   icon={Shield}        color="red"     />
          <StatCard title="Completion Rate"  value={`${completionRate}%`}           subtitle="Across all enrollments" icon={BarChart3}     color="green"   />
          <StatCard title="Overdue"          value={stats?.overdue ?? 0}            subtitle="Past due date"         icon={AlertTriangle}  color="orange"  />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(['ALL', 'MANDATORY', 'OPTIONAL'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterMandatory(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filterMandatory === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'ALL' ? 'All Courses' : f === 'MANDATORY' ? 'Mandatory' : 'Optional'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>

        {/* Course list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <div className="py-16 text-center text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No courses yet</p>
              <p className="text-sm mt-1">Click "Add Course" to create the first course.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((course) => (
              <CourseRow key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
