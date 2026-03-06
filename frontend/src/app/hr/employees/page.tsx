'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Search } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { employeeService } from '@/services/employee.service';
import { hrService } from '@/services/hr.service';
import { Employee } from '@/types';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll(1, 100),
  });

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => hrService.getDepartments() });
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: () => hrService.getRoles() });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, string | number>>();

  const createMutation = useMutation({
    mutationFn: (data: Record<string, string | number>) => employeeService.create(data),
    onSuccess: () => {
      toast.success('Employee created successfully');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowModal(false);
      reset();
    },
    onError: (err: { response?: { data?: { error?: string } } }) => {
      toast.error(err?.response?.data?.error || 'Failed to create employee');
    },
  });

  const employees = data?.employees ?? [];
  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return !q || `${e.first_name} ${e.last_name} ${e.employee_code} ${e.user?.email}`.toLowerCase().includes(q);
  });

  const columns = [
    {
      key: 'name',
      header: 'Employee',
      render: (row: Employee) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-semibold text-primary-700">
            {row.first_name?.[0]}{row.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium">{row.first_name} {row.last_name}</p>
            <p className="text-xs text-gray-400">{row.user?.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'employee_code', header: 'Code', render: (r: Employee) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">#{r.employee_code}</code> },
    { key: 'department', header: 'Department', render: (r: Employee) => r.department?.department_name ?? '—' },
    { key: 'role', header: 'Role', render: (r: Employee) => <span className="text-xs text-primary-600">{r.user?.role?.role_name?.replace('_', ' ')}</span> },
    { key: 'joining_date', header: 'Joined', render: (r: Employee) => r.joining_date ? format(new Date(r.joining_date), 'MMM d, yyyy') : '—' },
    { key: 'employment_status', header: 'Status', render: (r: Employee) => <StatusBadge status={r.employment_status} /> },
  ];

  const deptOptions = (departments ?? []).map((d) => ({ value: d.id, label: d.department_name }));
  const roleOptions = (roles ?? []).map((r) => ({ value: r.id, label: r.role_name.replace('_', ' ') }));
  const managerOptions = employees
    .filter((e) => e.user?.role?.role_name === 'EMPLOYEE_MANAGER')
    .map((e) => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }));

  return (
    <DashboardLayout title="Employees" subtitle="Manage employee profiles">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button leftIcon={UserPlus} onClick={() => setShowModal(true)}>Add Employee</Button>
        </div>

        <Card padding="sm">
          <div className="px-2 py-3 mb-2">
            <p className="text-sm text-gray-500">{filtered.length} of {employees.length} employees</p>
          </div>
          <Table
            columns={columns as Parameters<typeof Table>[0]['columns']}
            data={filtered as unknown as Record<string, unknown>[]}
            emptyMessage="No employees found"
            isLoading={isLoading}
          />
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Add New Employee" size="lg">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message as string} />
            <Input label="Last Name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message as string} />
          </div>
          <Input label="Email" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message as string} />
          <Input label="Password" type="password" {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} error={errors.password?.message as string} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Employee Code" {...register('employeeCode', { required: 'Required' })} error={errors.employeeCode?.message as string} />
            <Input label="Phone" {...register('phone')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" {...register('roleId', { required: 'Required' })} options={roleOptions} placeholder="Select role" error={errors.roleId?.message as string} />
            <Select label="Department" {...register('departmentId')} options={deptOptions} placeholder="Select department" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Manager" {...register('managerId')} options={managerOptions} placeholder="Select manager" />
            <Input label="Joining Date" type="date" {...register('joiningDate')} />
          </div>
          <Input label="Base Salary" type="number" step="0.01" {...register('baseSalary', { valueAsNumber: true })} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={createMutation.isPending} className="flex-1">Create Employee</Button>
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
