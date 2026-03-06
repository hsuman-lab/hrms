'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { leaveService } from '@/services/leave.service';
import toast from 'react-hot-toast';

const schema = z.object({
  leaveTypeId: z.string().min(1, 'Select a leave type'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
}).refine((d) => new Date(d.startDate) <= new Date(d.endDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type FormData = z.infer<typeof schema>;

export default function ApplyLeavePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: leaveTypes } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => leaveService.getTypes(),
  });

  const { data: balances } = useQuery({
    queryKey: ['leave-balance'],
    queryFn: () => leaveService.getBalance(),
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => leaveService.apply(data),
    onSuccess: () => {
      toast.success('Leave application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leave-balance'] });
      router.push('/leave');
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err?.response?.data?.error || 'Failed to apply for leave');
    },
  });

  const selectedTypeId = watch('leaveTypeId');
  const selectedBalance = balances?.find((b) => b.leave_type_id === selectedTypeId);

  const typeOptions = (leaveTypes ?? []).map((lt) => ({
    value: lt.id,
    label: `${lt.leave_name} (${lt.is_paid ? 'Paid' : 'Unpaid'})`,
  }));

  return (
    <DashboardLayout title="Apply for Leave" subtitle="Submit a new leave request">
      <div className="max-w-2xl">
        <Link href="/leave" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to My Leaves
        </Link>

        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Leave Application Form</h2>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
            <Select
              label="Leave Type"
              {...register('leaveTypeId')}
              options={typeOptions}
              placeholder="Select leave type"
              error={errors.leaveTypeId?.message}
            />

            {selectedBalance && (
              <div className="p-3 rounded-xl bg-primary-50 text-sm text-primary-700 flex justify-between">
                <span>Available Balance:</span>
                <span className="font-semibold">{selectedBalance.remaining_days} days remaining</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('startDate')}
                error={errors.startDate?.message}
              />
              <Input
                label="End Date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('endDate')}
                error={errors.endDate?.message}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
              <textarea
                {...register('reason')}
                rows={4}
                placeholder="Describe the reason for your leave request..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" isLoading={mutation.isPending} className="flex-1">
                Submit Leave Request
              </Button>
              <Link href="/leave">
                <Button type="button" variant="secondary">Cancel</Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
