'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { hrService } from '@/services/hr.service';
import { Department } from '@/types';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

type FormData = { name: string; description?: string };

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => hrService.getDepartments(),
  });

  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  const createMutation = useMutation({
    mutationFn: (d: FormData) => hrService.createDepartment(d.name, d.description),
    onSuccess: () => { toast.success('Department created'); queryClient.invalidateQueries({ queryKey: ['departments'] }); closeModal(); },
    onError: () => toast.error('Failed to create department'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => hrService.updateDepartment(id, data.name, data.description),
    onSuccess: () => { toast.success('Department updated'); queryClient.invalidateQueries({ queryKey: ['departments'] }); closeModal(); },
    onError: () => toast.error('Failed to update department'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hrService.deleteDepartment(id),
    onSuccess: () => { toast.success('Department deleted'); queryClient.invalidateQueries({ queryKey: ['departments'] }); },
    onError: (err: { response?: { data?: { error?: string } } }) => toast.error(err?.response?.data?.error || 'Failed to delete'),
  });

  const closeModal = () => { setShowModal(false); setEditing(null); reset(); };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setValue('name', dept.department_name);
    setValue('description', dept.description ?? '');
    setShowModal(true);
  };

  const onSubmit = (data: FormData) => {
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  return (
    <DashboardLayout title="Departments" subtitle="Manage organizational departments">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button leftIcon={Plus} onClick={() => { reset(); setShowModal(true); }}>Add Department</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(departments ?? []).map((dept) => (
              <Card key={dept.id} className="hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{dept.department_name}</h3>
                      <p className="text-xs text-gray-400">{dept._count?.employees ?? 0} employees</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(dept)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Delete ${dept.department_name}?`)) deleteMutation.mutate(dept.id);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {dept.description && <p className="text-xs text-gray-500 mt-3">{dept.description}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Department' : 'New Department'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Department Name" {...register('name', { required: true })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending} className="flex-1">
              {editing ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
