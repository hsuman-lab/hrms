export type RoleName = 'EMPLOYEE' | 'EMPLOYEE_MANAGER' | 'HR' | 'HR_MANAGER' | 'FINANCE';

export interface User {
  id: string;
  email: string;
  role?: RoleName;
  employee?: {
    id: string;
    employee_code: string;
    first_name: string | null;
    last_name: string | null;
    department?: string | null;
  } | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SalaryStructure {
  id: string;
  employee_id: string;
  basic_pct: number;
  hra_pct: number;
  da_pct: number;
  special_allowance_pct: number;
  other_allowance: number;
  pf_employee_pct: number;
  esi_applicable: boolean;
  professional_tax: number;
  tds_monthly: number;
}

export interface Employee {
  id: string;
  user_id: string;
  employee_code: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  whatsapp_no?: string | null;
  department_id: string | null;
  manager_id: string | null;
  joining_date: string | null;
  employment_status: string;
  base_salary: number | null;
  created_at: string;
  updated_at: string;
  user?: { email: string; role?: { role_name: string }; is_active: boolean };
  department?: { id: string; department_name: string } | null;
  manager?: { id: string; first_name: string; last_name: string; employee_code: string } | null;
  leave_balances?: LeaveBalance[];
  salary_structure?: SalaryStructure | null;
}

export interface Department {
  id: string;
  department_name: string;
  description: string | null;
  created_at: string;
  _count?: { employees: number };
}

export interface Role {
  id: string;
  role_name: string;
  description: string | null;
}

export interface Attendance {
  id: string;
  employee_id: string;
  attendance_date: string;
  clock_in: string | null;
  clock_out: string | null;
  status: string | null;
  created_at: string;
}

export interface LeaveType {
  id: string;
  leave_name: string;
  description: string | null;
  max_days: number | null;
  is_paid: boolean;
  carry_forward: boolean;
  created_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  total_days: number | null;
  used_days: number;
  remaining_days: number | null;
  leave_type: LeaveType;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number | null;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  applied_at: string;
  leave_type: LeaveType;
  employee?: Pick<Employee, 'id' | 'first_name' | 'last_name' | 'employee_code'> & { department?: { department_name: string } | null };
  approvals?: Array<{
    id: string;
    approval_status: string;
    remarks: string | null;
    approved_at: string | null;
    approver: { first_name: string | null; last_name: string | null };
  }>;
}

export interface PayrollRecord {
  id: string;
  employee_id: string;
  payroll_month: number;
  payroll_year: number;
  total_working_days: number | null;
  present_days: number | null;
  paid_leave_days: number | null;
  unpaid_leave_days: number | null;
  absent_days: number | null;
  salary_amount: string | null;    // gross
  basic: string | null;
  hra: string | null;
  da: string | null;
  special_allowance: string | null;
  other_allowance: string | null;
  pf_employee: string | null;
  esi_employee: string | null;
  professional_tax: string | null;
  tds: string | null;
  deductions: string | null;
  net_salary: string | null;
  generated_at: string;
  employee?: Pick<Employee, 'id' | 'first_name' | 'last_name' | 'employee_code'> & {
    department?: { department_name: string } | null;
  };
}

export type ReimbursementCategory = 'TRAVEL' | 'FOOD' | 'MEDICAL' | 'ACCOMMODATION' | 'OTHER';
export type ReimbursementStatus   = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Reimbursement {
  id: string;
  employee_id: string;
  category: ReimbursementCategory;
  amount: string;
  description: string;
  bill_date: string;
  status: ReimbursementStatus;
  applied_at: string;
  employee?: Pick<Employee, 'id' | 'first_name' | 'last_name' | 'employee_code'> & {
    department?: { department_name: string } | null;
  };
  approvals?: Array<{
    id: string;
    approval_status: string | null;
    remarks: string | null;
    approved_at: string | null;
    approver: { first_name: string | null; last_name: string | null };
  }>;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string;
  is_mandatory: boolean;
  duration_mins: number | null;
  created_at: string;
  updated_at: string;
  _count?: { enrollments: number };
  creator?: { employee?: { first_name: string | null; last_name: string | null } | null } | null;
}

export type EnrollmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface CourseEnrollment {
  id: string;
  course_id: string;
  employee_id: string;
  status: EnrollmentStatus;
  progress_pct: number;
  completed_at: string | null;
  due_date: string | null;
  assigned_at: string;
  course: Course;
  employee?: Pick<Employee, 'id' | 'first_name' | 'last_name' | 'employee_code'> & {
    department?: { department_name: string } | null;
  };
}

export interface LearningStats {
  totalCourses: number;
  mandatoryCourses: number;
  totalEnrollments: number;
  completed: number;
  overdue: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
