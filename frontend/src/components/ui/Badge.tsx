import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-orange-100 text-orange-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
  primary: 'bg-primary-100 text-primary-700',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    PRESENT: 'success',
    ABSENT: 'danger',
    LATE: 'warning',
    HALF_DAY: 'info',
    ACTIVE: 'success',
    INACTIVE: 'neutral',
    TERMINATED: 'danger',
  };
  return <Badge variant={map[status] || 'neutral'}>{status.replace('_', ' ')}</Badge>;
}
