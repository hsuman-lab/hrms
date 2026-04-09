'use client';

import Link from 'next/link';
import {
  Users, Clock, CalendarCheck, IndianRupee, BarChart3,
  Shield, BookOpen, Workflow, Bell, Building2, CheckCircle2,
  ArrowRight, Star, Globe, Zap, Lock, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import HarshHRLogo from '@/components/ui/HarshHRLogo';

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Users,
    title: 'Employee Management',
    description: 'Centralised employee profiles, org charts, documents, and lifecycle management — from hire to retire.',
    color: 'bg-cyan-50 text-cyan-700',
  },
  {
    icon: CalendarCheck,
    title: 'Leave Management',
    description: 'Configurable leave policies, accrual rules, holiday calendars, and one-click approvals with balance tracking.',
    color: 'bg-teal-50 text-teal-700',
  },
  {
    icon: Clock,
    title: 'Attendance & Geo-Fencing',
    description: 'Mobile check-in/out with GPS geo-fencing, shift management, and real-time attendance dashboards.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: IndianRupee,
    title: 'Payroll Engine',
    description: 'Formula-based salary computation, country-specific tax plugins (India TDS), payslips, and compliance reports.',
    color: 'bg-cyan-50 text-cyan-700',
  },
  {
    icon: Workflow,
    title: 'Approval Workflows',
    description: 'Visual multi-step approval workflows for any process — leave, expenses, promotions — with SLA and escalation.',
    color: 'bg-teal-50 text-teal-700',
  },
  {
    icon: BookOpen,
    title: 'Learning Management',
    description: 'Assign SCORM/video courses, track progress, auto-issue certificates, and monitor compliance training.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Users,
    title: 'Onboarding',
    description: 'Structured onboarding checklists with task assignment, e-sign documents, and per-hire progress tracking.',
    color: 'bg-cyan-50 text-cyan-700',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Multi-channel notifications (email, SMS, in-app) with per-user preferences and Handlebars templates.',
    color: 'bg-teal-50 text-teal-700',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Real-time dashboards on headcount, attrition, payroll costs, attendance trends, and custom exports.',
    color: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: Shield,
    title: 'Audit Trail',
    description: 'Tamper-proof, hash-chained audit log for every action — meets SOC 2, GDPR, and ISO 27001 requirements.',
    color: 'bg-cyan-50 text-cyan-700',
  },
  {
    icon: Building2,
    title: 'Multi-Tenant SaaS',
    description: 'Row-level security isolates each organisation. One deployment serves thousands of companies safely.',
    color: 'bg-teal-50 text-teal-700',
  },
  {
    icon: IndianRupee,
    title: 'Billing & Subscriptions',
    description: 'Stripe-integrated seat-based billing with trial periods, plan upgrades, and automated invoicing.',
    color: 'bg-emerald-50 text-emerald-700',
  },
];

const stats = [
  { value: '50K+', label: 'Employees Managed' },
  { value: '200+', label: 'Companies Onboarded' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4.9★', label: 'Customer Rating' },
];

const plans = [
  {
    name: 'Starter',
    price: '₹199',
    per: 'per employee / month',
    desc: 'Perfect for growing teams up to 50 people.',
    features: ['Employee & Leave Management', 'Attendance Tracking', 'Basic Payroll', 'Email Notifications', '5 GB Storage'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '₹399',
    per: 'per employee / month',
    desc: 'Everything you need to scale HR operations.',
    features: ['Everything in Starter', 'Approval Workflows', 'LMS & Onboarding', 'Advanced Analytics', 'Priority Support'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    per: 'contact us',
    desc: 'Full platform with white-label and SLAs.',
    features: ['Everything in Growth', 'Multi-Tenant Deployment', 'Custom Integrations', 'Dedicated CSM', 'SOC 2 Reports'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const faqs = [
  {
    q: 'Is my data secure?',
    a: "Yes. Every tenant's data is isolated via PostgreSQL row-level security. All data is encrypted at rest and in transit. We maintain a tamper-proof, hash-chained audit log for every action.",
  },
  {
    q: 'Can I try it before paying?',
    a: 'Absolutely. Every plan starts with a 30-day free trial — no credit card required. You can explore all features with pre-loaded demo data.',
  },
  {
    q: 'Does it support multiple countries?',
    a: 'Yes. Payroll supports country-specific tax plugins (India TDS included). Leave policies, holiday calendars, and compliance rules are configurable per country.',
  },
  {
    q: 'Can I integrate with existing tools?',
    a: 'HarshHR provides a REST API and publishes integration events via Kafka. Connectors for Slack, Google Workspace, and Zoho are on the roadmap.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors"
      >
        {q}
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-4 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <HarshHRLogo size={32} textSize="lg" />
          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
          </div>
          {/* CTA */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" /> Login
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-white via-cyan-50/40 to-teal-50/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <span className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5" /> Software as a Service · Trusted by 200+ Companies
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            The Modern HR Platform<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-teal-600">
              Built for Scale
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            HarshHR unifies employee management, payroll, attendance, leave, learning, and workflows
            in a single multi-tenant SaaS — so your HR team can focus on people, not paperwork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition-all text-base"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-base bg-white"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <span className="ml-2 text-sm text-gray-500 font-medium">4.9 / 5 from 180+ reviews</span>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="py-14 border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-primary-600 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-gray-50/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Everything You Need</span>
            <h2 className="mt-2 text-4xl font-extrabold text-gray-900">12 Modules. One Platform.</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Every module is production-ready, deeply integrated, and configurable to match your organisation's processes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary-700 to-teal-800 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold mb-4">Why HR teams love HarshHR</h2>
            <p className="text-primary-100 max-w-xl mx-auto">
              Built on modern architecture — Domain-Driven Design, event-driven, zero-downtime deploys.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: 'Global Ready',
                body: 'Multi-country payroll, locale-aware leave calendars, and timezone support built in.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                body: 'SOC 2 aligned. Row-level isolation, JWT auth, RBAC, and hash-chained audit logs.',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                body: 'Sub-100ms API responses backed by Redis caching, read replicas, and async Kafka events.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/10 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-primary-100 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">Pricing</span>
            <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-4 text-gray-500">Start free for 30 days. No credit card required.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-primary-600 to-teal-700 text-white border-transparent shadow-2xl scale-105'
                    : 'bg-white border-gray-200 shadow-card'
                }`}
              >
                {plan.highlight && (
                  <span className="text-xs font-bold bg-white/20 border border-white/30 text-white px-3 py-1 rounded-full self-start mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-primary-100' : 'text-gray-500'}`}>
                  {plan.desc}
                </p>
                <div className="mb-6">
                  <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ml-1 ${plan.highlight ? 'text-primary-100' : 'text-gray-400'}`}>
                    {plan.per}
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-primary-200' : 'text-teal-500'}`}
                      />
                      <span className={plan.highlight ? 'text-primary-50' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center font-semibold py-3 rounded-xl transition-all ${
                    plan.highlight
                      ? 'bg-white text-primary-700 hover:bg-primary-50'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 bg-gray-50/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-widest">FAQ</span>
            <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to modernise your HR?</h2>
          <p className="text-gray-500 mb-10 text-lg">
            Join 200+ companies already running on HarshHR. Start your 30-day free trial today.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all text-lg"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-gray-50 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <HarshHRLogo size={28} textSize="base" />
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} HarshHR. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
            <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Login →
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
