'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, CheckCircle, XCircle, AlertTriangle, IndianRupee } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { leaveService } from '@/services/leave.service';
import { LeaveType } from '@/types';
import { useForm, useWatch } from 'react-hook-form';
import toast from 'react-hot-toast';

type FormData = { leaveName: string; description?: string; maxDays: number; isPaid: boolean; carryForward: boolean };

export default function LeaveTypesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<LeaveType | null>(null);

  const { data: leaveTypes, isLoading } = useQuery({
    queryKey: ['leave-types'],
    queryFn: () => leaveService.getTypes(),
  });

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<FormData>({
    defaultValues: { isPaid: true, carryForward: false },
  });

  // Watch isPaid to drive the toggle UI and the LOP warning
  const isPaidValue = useWatch({ control, name: 'isPaid', defaultValue: true });

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

  const closeModal = () => { setShowModal(false); setEditing(null); reset({ isPaid: true, carryForward: false }); };

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
          <Button leftIcon={Plus} onClick={() => { reset({ isPaid: true, carryForward: false }); setShowModal(true); }}>
            Add Leave Type
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(leaveTypes ?? []).map((lt) => (
              <Card key={lt.id} className={`hover:shadow-card-hover transition-shadow ${!lt.is_paid ? 'border-amber-200' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{lt.leave_name}</h3>
                      {!lt.is_paid && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Unpaid
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{lt.description || 'No description'}</p>
                  </div>
                  <Button size="sm" variant="ghost" leftIcon={Pencil} onClick={() => openEdit(lt)}>Edit</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Max Days / Year</span>
                    <span className="font-semibold text-gray-800">{lt.max_days ?? 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Leave Category</span>
                    {lt.is_paid
                      ? <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      : <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <IndianRupee className="w-3 h-3" /> Unpaid (LOP)
                        </span>}
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Carry Forward</span>
                    {lt.carry_forward
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <XCircle className="w-4 h-4 text-gray-300" />}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Leave Type' : 'New Leave Type'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <Input
            label="Leave Name"
            required
            placeholder="e.g. Casual Leave, Sick Leave, Unpaid Leave"
            {...register('leaveName', { required: 'Required' })}
            error={errors.leaveName?.message}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Brief description of when this leave applies"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <Input
            label="Maximum Days Per Year"
            required
            type="number"
            placeholder="e.g. 12"
            {...register('maxDays', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Min 1' } })}
            error={errors.maxDays?.message}
          />

          {/* ── Paid / Unpaid toggle ── */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Leave Category <span className="text-red-500">*</span>
            </label>
            {/* Hidden checkbox — controlled by the toggle buttons */}
            <input type="checkbox" {...register('isPaid')} className="hidden" />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('isPaid', true, { shouldDirty: true })}
                className={`flex flex-col items-center gap-1.5 py-3.5 px-4 rounded-xl border-2 transition-all ${
                  isPaidValue
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <CheckCircle className={`w-5 h-5 ${isPaidValue ? 'text-green-600' : 'text-gray-300'}`} />
                <span className="text-sm font-semibold">Paid Leave</span>
                <span className="text-xs text-center leading-tight opacity-70">Salary not deducted<br />for days taken</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('isPaid', false, { shouldDirty: true });
                  setValue('carryForward', false); // unpaid rarely carries forward
                }}
                className={`flex flex-col items-center gap-1.5 py-3.5 px-4 rounded-xl border-2 transition-all ${
                  !isPaidValue
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 ${!isPaidValue ? 'text-amber-500' : 'text-gray-300'}`} />
                <span className="text-sm font-semibold">Unpaid Leave (LOP)</span>
                <span className="text-xs text-center leading-tight opacity-70">Salary deducted as<br />Loss of Pay</span>
              </button>
            </div>
            {!isPaidValue && (
              <div className="flex gap-2 items-start p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                <span>Days taken on this leave type will result in <strong>Loss of Pay (LOP)</strong>. The payroll engine will prorate the employee's gross salary accordingly.</span>
              </div>
            )}
          </div>

          {/* ── Carry Forward ── */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Additional Options</label>
            <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isPaidValue ? 'border-gray-200 hover:border-primary-300' : 'border-gray-100 opacity-50 cursor-not-allowed'}`}>
              <input
                type="checkbox"
                {...register('carryForward')}
                disabled={!isPaidValue}
                className="w-4 h-4 accent-primary-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-700">Carry Forward</p>
                <p className="text-xs text-gray-400">Unused days roll over to the next year</p>
                {!isPaidValue && <p className="text-xs text-amber-600 mt-0.5">Not applicable for unpaid leave</p>}
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={isPending} className="flex-1">
              {editing ? 'Update' : 'Create'} Leave Type
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
