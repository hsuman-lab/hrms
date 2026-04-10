'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { leaveService } from '@/services/leave.service';
import { LeaveType } from '@/types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

type FormData = { leaveName: string; description?: string; maxDays: number; isPaid: boolean; carryForward: boolean };

export default function LeaveTypesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<LeaveType | null>(null);

  const { data: leaveTypes, isLoading } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => leaveService.getTypes(),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: (data: FormData) => leaveService.createType(data as Record<string, unknown>),
    onSuccess: () => { toast.success('Leave type created'); queryClient.invalidateQueries({ queryKey: ['leave-types'] }); closeModal(); },
    onError: () => toast.error('Failed to create leave type'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => leaveService.updateType(id, data as Record<string, unknown>),
    onSuccess: () => { toast.success('Leave type updated'); queryClient.invalidateQueries({ queryKey: ['leave-types'] }); closeModal(); },
    onError: () => toast.error('Failed to update leave type'),
  });

  const closeModal = () => { setShowModal(false); setEditing(null); reset(); };

  const openEdit = (lt: LeaveType) => {
    setEditing(lt);
    setValue('leaveName', lt.leave_name);
    setValue('description', lt.description ?? '');
    setValue('maxDays', lt.max_days ?? 0);
    setValue('isPaid', lt.is_paid);
    setValue('carryForward', lt.carry_forward);
    setShowModal(true);
  };

  const onSubmit = (data: FormData) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <DashboardLayout title="Leave Types" subtitle="Configure leave policies for your organization">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button leftIcon={Plus} onClick={() => { reset(); setShowModal(true); }}>Add Leave Type</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(leaveTypes ?? []).map((lt) => (
              <Card key={lt.id} className="hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{lt.leave_name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{lt.description || 'No description'}</p>
                  </div>
                  <Button size="sm" variant="ghost" leftIcon={Pencil} onClick={() => openEdit(lt)}>Edit</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Max Days</span>
                    <span className="font-semibold text-gray-800">{lt.max_days ?? 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Paid Leave</span>
                    {lt.is_paid
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Unpaid (LOP)
                        </span>}
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Carry Forward</span>
                    {lt.carry_forward ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-300" />}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Leave Type' : 'New Leave Type'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Leave Name" required {...register('leaveName', { required: 'Required' })} error={errors.leaveName?.message} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <Input label="Maximum Days Per Year" required type="number" {...register('maxDays', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Min 1' } })} error={errors.maxDays?.message} />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Leave Options <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register('isPaid')} className="w-4 h-4 accent-primary-600" />
                Paid Leave
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register('carryForward')} className="w-4 h-4 accent-primary-600" />
                Carry Forward
              </label>
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              Unchecking <strong>Paid Leave</strong> marks this as an <strong>Unpaid (LOP)</strong> leave type — salary will be deducted for days taken.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isPending} className="flex-1">{editing ? 'Update' : 'Create'} Leave Type</Button>
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
