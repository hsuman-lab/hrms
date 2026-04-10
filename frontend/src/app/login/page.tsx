'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye, EyeOff, Mail, Lock,
  Users, CalendarCheck, IndianRupee, BookOpen, Receipt, BarChart3,
  ArrowRight, Shield, Clock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import HarshHRLogo from '@/components/ui/HarshHRLogo';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { role: 'Employee',   email: 'employee@hrms.com',   color: 'bg-violet-100 text-violet-700' },
  { role: 'Manager',    email: 'manager@hrms.com',    color: 'bg-pink-100 text-pink-700' },
  { role: 'HR',         email: 'hr@hrms.com',         color: 'bg-emerald-100 text-emerald-700' },
  { role: 'HR Manager', email: 'hrmanager@hrms.com',  color: 'bg-amber-100 text-amber-700' },
  { role: 'Finance',    email: 'finance@hrms.com',    color: 'bg-blue-100 text-blue-700' },
];

const WORKFLOW_STEPS = [
  { icon: Users,         color: '#7C3AED', bg: 'bg-violet-500', label: 'Onboarding',       desc: 'Employee profiles, salary structure & WhatsApp in one flow' },
  { icon: CalendarCheck, color: '#DB2777', bg: 'bg-pink-500',   label: 'Leave Management', desc: 'Apply, approve & track leaves with real-time balances' },
  { icon: Receipt,       color: '#F59E0B', bg: 'bg-amber-500',  label: 'Reimbursements',   desc: 'Submit claims; manager approves via reporting chain' },
  { icon: IndianRupee,   color: '#10B981', bg: 'bg-emerald-500',label: 'Indian Payroll',   desc: 'Basic, HRA, DA, PF, ESI, PT, TDS computed automatically' },
  { icon: BookOpen,      color: '#3B82F6', bg: 'bg-blue-500',   label: 'L&D Courses',      desc: 'Mandatory POSH, COBC & IT training tracked per employee' },
  { icon: BarChart3,     color: '#EC4899', bg: 'bg-pink-400',   label: 'Analytics',        desc: 'Headcount, attendance, payroll and leave at a glance' },
];

const STATS = [
  { value: '5',    label: 'Roles',     color: 'text-violet-300' },
  { value: '∞',   label: 'Employees', color: 'text-pink-300' },
  { value: '100%', label: 'Cloud',     color: 'text-amber-300' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT: HR Workflow infographic ─────────────────────────────── */}
      <div className="hidden lg:flex w-full lg:w-[56%] relative flex-col overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1e1b4b 0%, #4c1d95 35%, #831843 70%, #92400e 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
          <div className="absolute top-1/3 -right-20 w-72 h-72 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #DB2777, transparent)' }} />
          <div className="absolute -bottom-20 left-1/4 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />
        </div>

        <div className="relative z-10 flex flex-col h-full px-12 py-12">

          {/* Logo + tagline */}
          <div className="mb-10">
            <HarshHRLogo size={48} textSize="xl" theme="light" />
            <p className="text-white/50 text-xs mt-2 uppercase tracking-widest font-medium">End-to-end HR Platform</p>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h2 className="text-white text-3xl font-extrabold leading-tight">
              Everything your team<br />
              <span style={{ background: 'linear-gradient(90deg, #A78BFA, #F472B6, #FCD34D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                needs in one place
              </span>
            </h2>
            <p className="text-white/60 text-sm mt-3 max-w-sm leading-relaxed">
              From onboarding to payroll, leave to learning — MyHR automates the entire HR lifecycle.
            </p>
          </div>

          {/* Workflow steps — vertical flow with connectors */}
          <div className="flex-1 flex flex-col gap-0">
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex gap-4 items-start group">
                  {/* Icon + connector */}
                  <div className="flex flex-col items-center">
                    <div className={`${step.bg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <div className="w-px flex-1 min-h-[20px] my-1" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.05))' }} />
                    )}
                  </div>
                  {/* Text */}
                  <div className="pb-4 min-w-0">
                    <p className="text-white text-sm font-semibold leading-tight">{step.label}</p>
                    <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-8 pt-6 border-t border-white/10 mt-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1.5 text-white/30 text-xs">
              <Clock className="w-3 h-3" /> Real-time sync
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login panel ────────────────────────────────────────── */}
      <div className="w-full lg:w-[44%] flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Logo (mobile only — hidden on lg since it shows on left) */}
          <div className="mb-8 lg:mb-6">
            <div className="lg:hidden mb-4">
              <HarshHRLogo size={42} textSize="lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue to your workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-gray-200 hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 text-white rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md mt-2"
              style={{ background: isSubmitting ? '#7C3AED' : 'linear-gradient(90deg, #7C3AED, #DB2777)' }}>
              {isSubmitting ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Demo Accounts · password123</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button key={acc.email}
                  onClick={() => { setValue('email', acc.email); setValue('password', 'password123'); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50 transition-all text-left group">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${acc.color}`}>{acc.role[0]}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 group-hover:text-violet-700">{acc.role}</p>
                    <p className="text-xs text-gray-400 truncate">{acc.email.split('@')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-300 mt-8">© {new Date().getFullYear()} MyHR. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
}
