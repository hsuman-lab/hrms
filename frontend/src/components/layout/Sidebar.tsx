'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Clock, CalendarDays, Users, CheckSquare,
  IndianRupee, BarChart3, FileText, Building2, LogOut, BookOpen, Receipt,
  UserCircle, Target, Network, ClipboardList, DoorOpen, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { employeeService } from '@/services/employee.service';
import { RoleName } from '@/types';
import HarshHRLogo from '@/components/ui/HarshHRLogo';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: RoleName[];
  managerOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  /** If set, group is only shown when user has one of these roles */
  roles?: RoleName[];
  /** If true, group is only shown when user is a reporting manager */
  managerOnly?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'My Workspace',
    items: [
      { label: 'Dashboard',        href: '/dashboard',     icon: LayoutDashboard },
      { label: 'Attendance',       href: '/attendance',    icon: Clock },
      { label: 'My Leaves',        href: '/leave',         icon: CalendarDays },
      { label: 'My Payroll',       href: '/payroll',       icon: IndianRupee },
      { label: 'Reimbursements',   href: '/reimbursement', icon: Receipt },
    ],
  },
  {
    title: 'My Profile',
    items: [
      { label: 'ESS — Profile',    href: '/ess',           icon: UserCircle },
      { label: 'Performance',      href: '/pms',           icon: Target },
      { label: 'My Learning',      href: '/learning',      icon: BookOpen },
    ],
  },
  {
    title: 'Organisation',
    items: [
      { label: 'My Organisation',  href: '/org',           icon: Network },
      { label: 'Onboarding',       href: '/onboarding',    icon: ClipboardList },
      { label: 'Offboarding',      href: '/offboarding',   icon: DoorOpen },
    ],
  },
  {
    title: 'Manager',
    managerOnly: true,
    items: [
      { label: 'My Team',          href: '/manager/team',      icon: Users },
      { label: 'Approvals',        href: '/manager/approvals', icon: CheckSquare },
    ],
  },
  {
    title: 'HR',
    roles: ['HR', 'HR_MANAGER'],
    items: [
      { label: 'Employees',        href: '/hr/employees',    icon: Users },
      { label: 'L&D Courses',      href: '/hr/learning',     icon: BookOpen },
      { label: 'Leave Types',      href: '/hr/leave-types',  icon: FileText },
      { label: 'Departments',      href: '/hr/departments',  icon: Building2 },
    ],
  },
  {
    title: 'Finance & Reports',
    roles: ['FINANCE', 'HR_MANAGER'],
    items: [
      { label: 'Payroll Reports',  href: '/finance',         icon: IndianRupee },
      { label: 'Analytics',        href: '/hr/analytics',    icon: BarChart3,    roles: ['HR_MANAGER'] },
    ],
  },
];

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  return (
    <Link href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
        isActive
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
      }`}>
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`} />
      {item.label}
    </Link>
  );
}

function NavGroupSection({
  group, pathname, defaultOpen = true,
}: {
  group: NavGroup; pathname: string; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-500 transition-colors">
        {group.title}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5">
          {group.items.map(item => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  const { data: managerStatus } = useQuery({
    queryKey: ['is-manager'],
    queryFn: employeeService.isManager,
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  const isManager = managerStatus?.isManager ?? false;

  const visibleGroups = NAV_GROUPS.filter(group => {
    if (group.managerOnly && !isManager) return false;
    if (group.roles && !hasRole(...group.roles)) return false;
    return true;
  }).map(group => ({
    ...group,
    items: group.items.filter(item => !item.roles || hasRole(...item.roles)),
  })).filter(group => group.items.length > 0);

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-primary-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-primary-100">
        <HarshHRLogo size={34} textSize="base" />
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-primary-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.employee?.first_name?.[0]}{user?.employee?.last_name?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.employee?.first_name} {user?.employee?.last_name}
            </p>
            <span className="text-[11px] text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full font-medium">
              {user?.role?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-2">
        {visibleGroups.map((group, i) => (
          <NavGroupSection
            key={group.title}
            group={group}
            pathname={pathname}
            defaultOpen={i < 3}
          />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-primary-100">
        <button onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
