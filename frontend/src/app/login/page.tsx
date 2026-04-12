'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
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
  { role: 'Employee',   email: 'employee@hrms.com'  },
  { role: 'Manager',    email: 'manager@hrms.com'   },
  { role: 'HR',         email: 'hr@hrms.com'        },
  { role: 'HR Manager', email: 'hrmanager@hrms.com' },
  { role: 'Finance',    email: 'finance@hrms.com'   },
];

const STEPS = [
  {
    num: '01',
    label: 'Onboarding',
    desc: 'Create employee profile with salary structure',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="6" r="3" />
        <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" />
        <path d="M14 9l1.5 1.5L18 8" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    num: '02',
    label: 'Leave Management',
    desc: 'Apply, approve & track with live balances',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="14" height="13" rx="2" />
        <path d="M3 8h14" />
        <path d="M7 2v3M13 2v3" />
        <path d="M7 12l2 2 4-4" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    num: '03',
    label: 'Reimbursements',
    desc: 'Expense claims approved by reporting manager',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
        <path d="M3 8h14" />
        <path d="M7 12h2M13 12h1" />
      </svg>
    ),
  },
  {
    num: '04',
    label: 'Indian Payroll',
    desc: 'Basic, HRA, DA, PF, ESI, PT & TDS auto-calculated',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h10M5 4a2 2 0 000 4h3c2 0 3.5 1.5 3.5 3.5S9.5 15 7 15H5M8 4v1" />
        <path d="M5 8h5" />
      </svg>
    ),
  },
  {
    num: '05',
    label: 'Learning & Development',
    desc: 'POSH, COBC & IT mandatory course tracking',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5l7-2 7 2v5c0 3.5-3 6-7 7-4-1-7-3.5-7-7V5z" />
        <path d="M7.5 10l2 2 3-3" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    num: '06',
    label: 'Analytics',
    desc: 'Headcount, attendance & payroll insights',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 15l4-5 4 2 5-7" />
        <path d="M3 17h14" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (err) {
      const e = err as AxiosError<{ error?: string }>;
      toast.error(e.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── LEFT: Infographic ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col px-14 py-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #0f766e 0%, #0891b2 100%)' }}>

        {/* Faint horizontal rule lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)' }} />

        <div className="relative z-10 flex flex-col h-full">

          {/* Logo */}
          <div className="mb-14">
            <HarshHRLogo size={40} textSize="lg" theme="light" />
          </div>

          {/* Headline */}
          <div className="mb-10">
            <p className="text-cyan-300 text-xs font-semibold uppercase tracking-[0.2em] mb-3">HR Workflow</p>
            <h2 className="text-white text-2xl font-bold leading-tight">
              Everything in one place.<br />Nothing left behind.
            </h2>
          </div>

          {/* Steps — numbered list style */}
          <div className="flex-1 flex flex-col justify-between">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-4 group">
                {/* Number + line */}
                <div className="flex flex-col items-center self-stretch">
                  <div className="w-8 h-8 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center shrink-0 text-white group-hover:bg-white/20 transition-colors">
                    {step.icon}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px flex-1 my-1 bg-white/10" />
                  )}
                </div>
                {/* Label */}
                <div className="py-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-bold text-white/30 tabular-nums">{step.num}</span>
                    <span className="text-white text-sm font-semibold">{step.label}</span>
                  </div>
                  <p className="text-white/45 text-xs mt-0.5 leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer stats */}
          <div className="flex gap-10 pt-8 mt-6 border-t border-white/10">
            {[['5+', 'Roles'], ['∞', 'Scale'], ['100%', 'Cloud']].map(([v, l]) => (
              <div key={l}>
                <p className="text-white font-bold text-lg">{v}</p>
                <p className="text-white/35 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-[#f0fdfa] px-6 py-12">
        <div className="w-full max-w-[340px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <HarshHRLogo size={36} textSize="base" />
          </div>

          {/* Card */}
          <div className="bg-white border border-teal-100 rounded-2xl px-8 py-8 shadow-sm">
            <div className="mb-6">
              <h1 className="text-lg font-bold text-gray-800">Sign in to MyHR</h1>
              <p className="text-gray-400 text-sm mt-0.5">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-500" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@company.com"
                    className="w-full pl-8.5 pl-[2.1rem] pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-teal-500" />
                  <input
                    {...register('password')}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-[2.1rem] pr-9 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-teal-500 transition-colors">
                    {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(90deg, #0f766e, #0891b2)' }}>
                {isSubmitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in…</>
                  : <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="mt-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="w-3 h-3 text-teal-400" />
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Demo · password123</p>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button key={acc.email}
                  onClick={() => { setValue('email', acc.email); setValue('password', 'password123'); }}
                  className="py-1.5 px-2 rounded-lg bg-white border border-teal-100 hover:border-teal-300 hover:bg-teal-50 text-xs font-medium text-gray-500 hover:text-teal-700 transition-all text-center truncate">
                  {acc.role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-300 mt-6">© {new Date().getFullYear()} MyHR</p>
        </div>
      </div>

    </div>
  );
}
