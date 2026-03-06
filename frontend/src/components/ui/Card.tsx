import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ children, className, padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div className={cn('bg-white rounded-2xl shadow-card border border-primary-50', paddings[padding], className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'primary' | 'teal' | 'green' | 'orange' | 'red' | 'purple';
}

const colorMap = {
  primary: { bg: 'bg-primary-50', icon: 'text-primary-600', iconBg: 'bg-primary-100' },
  teal: { bg: 'bg-teal-50', icon: 'text-teal-600', iconBg: 'bg-teal-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', iconBg: 'bg-green-100' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600', iconBg: 'bg-orange-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', iconBg: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', iconBg: 'bg-purple-100' },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = 'primary' }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <Card className="hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', colors.iconBg)}>
          <Icon className={cn('w-6 h-6', colors.icon)} />
        </div>
      </div>
    </Card>
  );
}
