'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Clock, CalendarDays, Users, CheckSquare,
  IndianRupee, BarChart3, FileText, Building2, LogOut, BookOpen, Receipt,
} from 'lucide-react';
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
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',       href: '/dashboard',          icon: LayoutDashboard },
  { label: 'Attendance',      href: '/attendance',         icon: Clock },
  { label: 'My Leaves',       href: '/leave',              icon: CalendarDays },
  { label: 'My Payroll',      href: '/payroll',            icon: IndianRupee },
  { label: 'Reimbursements',  href: '/reimbursement',      icon: Receipt },
  { label: 'My Learning',     href: '/learning',           icon: BookOpen },
  { label: 'Team',            href: '/manager/team',       icon: Users,       roles: ['EMPLOYEE_MANAGER', 'HR', 'HR_MANAGER'] },
  { label: 'Employees',       href: '/hr/employees',       icon: Users,       roles: ['HR', 'HR_MANAGER'] },
  { label: 'L&D Courses',     href: '/hr/learning',        icon: BookOpen,    roles: ['HR', 'HR_MANAGER'] },
  { label: 'Leave Types',     href: '/hr/leave-types',     icon: FileText,    roles: ['HR', 'HR_MANAGER'] },
  { label: 'Departments',     href: '/hr/departments',     icon: Building2,   roles: ['HR', 'HR_MANAGER'] },
  { label: 'Analytics',       href: '/hr/analytics',       icon: BarChart3,   roles: ['HR_MANAGER'] },
  { label: 'Payroll Reports', href: '/finance',            icon: IndianRupee, roles: ['FINANCE', 'HR_MANAGER'] },
];

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

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || hasRole(...item.roles));

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-primary-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-primary-100">
        <HarshHRLogo size={34} textSize="base" />
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-primary-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.employee?.first_name?.[0]}{user?.employee?.last_name?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.employee?.first_name} {user?.employee?.last_name}
            </p>
            <span className="text-xs text-primary-500 bg-primary-50 px-2 py-0.5 rounded-full">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
              }`}>
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'}`} />
              {item.label}
            </Link>
          );
        })}

        {/* Approvals — shown only when user is a reporting manager */}
        {isManager && (
          <Link href="/manager/approvals"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
              pathname === '/manager/approvals' || pathname.startsWith('/manager/approvals/')
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
            }`}>
            <CheckSquare className={`w-4 h-4 shrink-0 ${
              pathname === '/manager/approvals' || pathname.startsWith('/manager/approvals/')
                ? 'text-white' : 'text-gray-400 group-hover:text-primary-600'
            }`} />
            Approvals
          </Link>
        )}
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
