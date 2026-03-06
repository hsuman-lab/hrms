'use client';

import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-primary-100 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 hidden sm:block">
          {format(new Date(), 'EEEE, MMM d yyyy')}
        </span>
        <button className="relative p-2 rounded-xl hover:bg-primary-50 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {user?.employee?.first_name?.[0]}{user?.employee?.last_name?.[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
