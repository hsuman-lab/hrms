'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Search, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
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

// ─── Salary structure section (collapsible) ──────────────────────────────────
function SalaryStructureSection({ register }: { register: ReturnType<typeof useForm>['register'] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
      >
        <span>Indian Salary Structure</span>
        <span className="flex items-center gap-2 text-xs font-normal text-gray-400">
          {open ? 'collapse' : 'expand to configure'}
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {open && (
        <div className="p-4 space-y-4 bg-white">
          {/* Earnings */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Earnings (% of Gross)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Basic % <span className="text-gray-400">(default 40)</span></label>
                <input type="number" step="0.01" placeholder="40"
                  {...register('salaryStructure.basicPct', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">HRA % <span className="text-gray-400">(default 20)</span></label>
                <input type="number" step="0.01" placeholder="20"
                  {...register('salaryStructure.hraPct', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">DA % <span className="text-gray-400">(default 10)</span></label>
                <input type="number" step="0.01" placeholder="10"
                  {...register('salaryStructure.daPct', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Special Allow. % <span className="text-gray-400">(default 20)</span></label>
                <input type="number" step="0.01" placeholder="20"
                  {...register('salaryStructure.specialAllowancePct', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Other Allowance (₹ fixed, default 0)</label>
                <input type="number" step="0.01" placeholder="0"
                  {...register('salaryStructure.otherAllowance', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Statutory Deductions</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">PF Employee % <span className="text-gray-400">(default 12)</span></label>
                <input type="number" step="0.01" placeholder="12"
                  {...register('salaryStructure.pfEmployeePct', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Professional Tax (₹/mo, default 200)</label>
                <input type="number" step="0.01" placeholder="200"
                  {...register('salaryStructure.professionalTax', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">TDS (₹/mo estimate, default 0)</label>
                <input type="number" step="0.01" placeholder="0"
                  {...register('salaryStructure.tdsMonthly', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox"
                  {...register('salaryStructure.esiApplicable')}
                  id="esi" className="w-4 h-4 accent-primary-600 rounded" />
                <label htmlFor="esi" className="text-xs font-medium text-gray-700 cursor-pointer">
                  ESI Applicable <span className="text-gray-400">(gross ≤ ₹21,000)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 bg-blue-50 rounded-lg px-3 py-2">
            Percentages must add up to ≤ 100%. PF is capped at ₹15,000 wage ceiling (max ₹1,800/mo).
            Leave blank to use system defaults.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll(1, 100),
  });

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => hrService.getDepartments() });
  const { data: roles }       = useQuery({ queryKey: ['roles'],       queryFn: () => hrService.getRoles() });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, unknown>>();

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => employeeService.create(data),
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
  const filtered  = employees.filter((e) => {
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
    { key: 'employee_code', header: 'Code',       render: (r: Employee) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">#{r.employee_code}</code> },
    { key: 'department',   header: 'Department',  render: (r: Employee) => r.department?.department_name ?? '—' },
    { key: 'role',         header: 'Role',        render: (r: Employee) => <span className="text-xs text-primary-600">{r.user?.role?.role_name?.replace('_', ' ')}</span> },
    {
      key: 'contact',
      header: 'Contact',
      render: (r: Employee) => (
        <div className="text-xs space-y-0.5">
          {r.phone && <div className="text-gray-500">{r.phone}</div>}
          {(r as Employee & { whatsapp_no?: string }).whatsapp_no && (
            <div className="flex items-center gap-1 text-green-600">
              <MessageCircle className="w-3 h-3" />
              {(r as Employee & { whatsapp_no?: string }).whatsapp_no}
            </div>
          )}
          {!r.phone && !(r as Employee & { whatsapp_no?: string }).whatsapp_no && <span className="text-gray-300">—</span>}
        </div>
      ),
    },
    { key: 'joining_date',      header: 'Joined', render: (r: Employee) => r.joining_date ? format(new Date(r.joining_date), 'MMM d, yyyy') : '—' },
    { key: 'employment_status', header: 'Status', render: (r: Employee) => <StatusBadge status={r.employment_status} /> },
  ];

  const deptOptions    = (departments ?? []).map((d) => ({ value: d.id, label: d.department_name }));
  const roleOptions    = (roles ?? []).map((r) => ({ value: r.id, label: r.role_name.replace('_', ' ') }));
  const managerOptions = employees
    .filter((e) => ['EMPLOYEE_MANAGER', 'HR', 'HR_MANAGER'].includes(e.user?.role?.role_name ?? ''))
    .map((e) => ({ value: e.id, label: `${e.first_name} ${e.last_name} (${e.employee_code})` }));

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

      {/* ── Add Employee Modal ── */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Onboard New Employee" size="lg">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

          {/* Personal details */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Personal Details</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name *" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message as string} />
              <Input label="Last Name *"  {...register('lastName',  { required: 'Required' })} error={errors.lastName?.message as string} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...register('phone')} placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-green-500" /> WhatsApp No.
                </label>
                <input {...register('whatsappNo')} placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Login Account</p>
            <Input label="Email *" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message as string} />
            <div className="mt-3">
              <Input label="Password *" type="password" {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 chars' } })} error={errors.password?.message as string} />
            </div>
          </div>

          {/* Employment */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Employment Details</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Employee Code *" {...register('employeeCode', { required: 'Required' })} error={errors.employeeCode?.message as string} />
              <Input label="Joining Date" type="date" {...register('joiningDate')} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Select label="Role *" {...register('roleId', { required: 'Required' })} options={roleOptions} placeholder="Select role" error={errors.roleId?.message as string} />
              <Select label="Department" {...register('departmentId')} options={deptOptions} placeholder="Select department" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <Select label="Reporting Manager" {...register('managerId')} options={managerOptions} placeholder="Select manager" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gross Monthly CTC (₹) *</label>
                <input type="number" step="0.01" {...register('baseSalary', { valueAsNumber: true, required: 'Required' })}
                  placeholder="e.g. 50000"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                {errors.baseSalary && <p className="text-xs text-red-500 mt-1">{errors.baseSalary.message as string}</p>}
              </div>
            </div>
          </div>

          {/* Indian Salary Structure */}
          <SalaryStructureSection register={register as unknown as ReturnType<typeof useForm>['register']} />

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
            <Button type="submit" isLoading={createMutation.isPending} className="flex-1">Onboard Employee</Button>
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
