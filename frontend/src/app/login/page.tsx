'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye, EyeOff, Mail, Lock,
  Users, CalendarCheck, IndianRupee, BookOpen, Receipt, BarChart3,
  ArrowRight, Shield,
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
  { role: 'Employee',   email: 'employee@hrms.com',   color: 'bg-cyan-100 text-cyan-700' },
  { role: 'Manager',    email: 'manager@hrms.com',    color: 'bg-violet-100 text-violet-700' },
  { role: 'HR',         email: 'hr@hrms.com',         color: 'bg-emerald-100 text-emerald-700' },
  { role: 'HR Manager', email: 'hrmanager@hrms.com',  color: 'bg-amber-100 text-amber-700' },
  { role: 'Finance',    email: 'finance@hrms.com',    color: 'bg-rose-100 text-rose-700' },
];

// ── HR Workflow steps shown on the right panel ────────────────────────────────
const WORKFLOW_STEPS = [
  {
    icon: Users,
    color: 'bg-cyan-500',
    label: 'Onboarding',
    desc: 'Employee profiles, salary structure & WhatsApp in one flow',
  },
  {
    icon: CalendarCheck,
    color: 'bg-violet-500',
    label: 'Leave Management',
    desc: 'Apply, approve & track leaves with real-time balances',
  },
  {
    icon: Receipt,
    color: 'bg-amber-500',
    label: 'Reimbursements',
    desc: 'Submit expense claims; manager approves via reporting chain',
  },
  {
    icon: IndianRupee,
    color: 'bg-emerald-500',
    label: 'Indian Payroll',
    desc: 'Basic, HRA, DA, PF, ESI, PT, TDS computed automatically',
  },
  {
    icon: BookOpen,
    color: 'bg-pink-500',
    label: 'L&D Courses',
    desc: 'Mandatory POSH, COBC & IT training tracked per employee',
  },
  {
    icon: BarChart3,
    color: 'bg-blue-500',
    label: 'Analytics',
    desc: 'Headcount, attendance, payroll and leave analytics at a glance',
  },
];

const STATS = [
  { value: '5', label: 'Roles' },
  { value: '∞', label: 'Employees' },
  { value: '100%', label: 'Cloud' },
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

      {/* ── Left: Login panel ─────────────────────────────────────────── */}
      <div className="w-full lg:w-[44%] flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="mb-8">
            <HarshHRLogo size={42} textSize="lg" />
            <p className="text-gray-400 text-sm mt-1.5">Human Resource Management System</p>
          </div>

          {/* Heading */}
          <div className="mb-7">
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
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-gray-200 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
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
                  className="w-full pl-10 pr-10 py-3 text-sm rounded-xl border border-gray-200 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm mt-2">
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
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all text-left group">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${acc.color}`}>{acc.role[0]}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 group-hover:text-primary-700">{acc.role}</p>
                    <p className="text-xs text-gray-400 truncate">{acc.email.split('@')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: HR Workflow infographic ────────────────────────────── */}
      <div className="hidden lg:flex w-full lg:w-[56%] relative flex-col justify-between overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 40%, #0f766e 100%)' }}>

        {/* Background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 bg-white" />
          <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full opacity-10 bg-white" />
          <div className="absolute -bottom-16 right-1/3 w-48 h-48 rounded-full opacity-10 bg-white" />
        </div>

        <div className="relative z-10 flex flex-col h-full px-12 py-12">

          {/* Top text */}
          <div className="mb-10">
            <p className="text-cyan-200 text-xs font-semibold uppercase tracking-widest mb-2">End-to-end HR Platform</p>
            <h2 className="text-white text-3xl font-bold leading-snug">
              Everything your team<br />needs in one place
            </h2>
            <p className="text-cyan-100/80 text-sm mt-3 max-w-sm">
              From onboarding to payroll, leave to learning — HarshHR automates the entire HR lifecycle.
            </p>
          </div>

          {/* Workflow steps grid */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i}
                  className="group flex gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm rounded-2xl p-4 transition-all border border-white/10 hover:border-white/20">
                  <div className={`${step.color} w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold mb-0.5">{step.label}</p>
                    <p className="text-cyan-100/70 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom stats bar */}
          <div className="mt-8 flex items-center gap-8 pt-6 border-t border-white/15">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-white text-2xl font-bold">{s.value}</p>
                <p className="text-cyan-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
            <div className="ml-auto text-right">
              <p className="text-white/50 text-xs">Powered by</p>
              <HarshHRLogo size={20} textSize="sm" theme="dark" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
