'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, Shield,
  Users, CalendarCheck, IndianRupee, BookOpen, Receipt, BarChart3,
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
  { role: 'Employee',   email: 'employee@hrms.com' },
  { role: 'Manager',    email: 'manager@hrms.com'  },
  { role: 'HR',         email: 'hr@hrms.com'       },
  { role: 'HR Manager', email: 'hrmanager@hrms.com'},
  { role: 'Finance',    email: 'finance@hrms.com'  },
];

const WORKFLOW_STEPS = [
  { icon: Users,         label: 'Onboarding',       desc: 'Employee profiles, salary structure & documents' },
  { icon: CalendarCheck, label: 'Leave Management',  desc: 'Apply, approve & track leaves in real time'      },
  { icon: Receipt,       label: 'Reimbursements',    desc: 'Expense claims routed to reporting manager'       },
  { icon: IndianRupee,   label: 'Indian Payroll',    desc: 'Basic, HRA, DA, PF, ESI, PT, TDS auto-computed'  },
  { icon: BookOpen,      label: 'L&D',               desc: 'Mandatory POSH, COBC & IT training tracking'     },
  { icon: BarChart3,     label: 'Analytics',         desc: 'Attendance, headcount & payroll insights'        },
];

export default function LoginPage() {
  const { login }  = useAuth();
  const router     = useRouter();
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f0fdfc]">

      {/* ── LEFT: Infographic ───────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between px-14 py-12"
        style={{ background: 'linear-gradient(160deg, #0d9488 0%, #0891b2 60%, #06b6d4 100%)' }}>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-12">
            <HarshHRLogo size={44} textSize="lg" theme="light" />
            <p className="text-teal-100/60 text-xs mt-1.5 tracking-widest uppercase font-medium">HR Management Platform</p>
          </div>

          {/* Headline */}
          <div className="mb-10">
            <h2 className="text-white text-[2rem] font-bold leading-snug">
              One platform for<br />
              <span className="text-cyan-200">your entire HR lifecycle</span>
            </h2>
            <p className="text-white/60 text-sm mt-3 max-w-xs leading-relaxed">
              From onboarding to payroll — MyHR keeps your team running smoothly.
            </p>
          </div>

          {/* Workflow steps */}
          <div className="flex-1 space-y-0">
            {WORKFLOW_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 && (
                      <div className="w-px h-5 bg-white/15 my-0.5" />
                    )}
                  </div>
                  <div className="pt-1 pb-3">
                    <p className="text-white text-sm font-medium">{step.label}</p>
                    <p className="text-white/50 text-xs leading-relaxed mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom stats */}
          <div className="flex gap-8 pt-6 border-t border-white/10 mt-2">
            {[['5+', 'Roles'], ['∞', 'Employees'], ['100%', 'Cloud']].map(([v, l]) => (
              <div key={l}>
                <p className="text-white text-xl font-bold">{v}</p>
                <p className="text-white/40 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login ─────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-6 py-12 bg-[#f0fdfc]">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <HarshHRLogo size={38} textSize="base" />
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 px-8 py-9">
            <div className="mb-7">
              <h1 className="text-xl font-bold text-gray-800">Sign in</h1>
              <p className="text-gray-400 text-sm mt-1">Welcome back to MyHR</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@company.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white transition-all"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                  <input
                    {...register('password')}
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-gray-200 bg-gray-50 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(90deg, #0d9488, #0891b2)' }}>
                {isSubmitting
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>
                  : <>Sign In <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="mt-5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Demo Accounts · password123</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <button key={acc.email}
                  onClick={() => { setValue('email', acc.email); setValue('password', 'password123'); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-teal-100 hover:border-teal-300 hover:bg-teal-50 transition-all text-left group">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {acc.role[0]}
                  </span>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-teal-700 truncate">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-300 mt-6">© {new Date().getFullYear()} MyHR. All rights reserved.</p>
        </div>
      </div>

    </div>
  );
}
