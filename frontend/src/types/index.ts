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

// ── ESS ──────────────────────────────────────────────────────────────────────
export interface EmployeeAddress {
  id: string;
  address_type: string;
  line1: string;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country: string;
}

export interface BankDetail {
  id: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: string;
  branch?: string | null;
  is_verified: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string | null;
  is_primary: boolean;
}

export interface EmployeeDocument {
  id: string;
  doc_type: string;
  doc_name: string;
  file_url: string;
  file_size?: number | null;
  uploaded_at: string;
  expires_at?: string | null;
  is_verified: boolean;
}

// ── PMS ──────────────────────────────────────────────────────────────────────
export interface PerformanceGoal {
  id: string;
  title: string;
  description?: string | null;
  goal_type: string;
  metric_type: string;
  target_value?: string | null;
  achieved_value?: string | null;
  weightage?: number | null;
  due_date?: string | null;
  review_period?: string | null;
  status: string;
  progress_pct: number;
  created_at: string;
}

export interface SelfAssessment {
  id: string;
  review_period: string;
  strengths?: string | null;
  improvements?: string | null;
  achievements?: string | null;
  rating_self?: number | null;
  overall_comment?: string | null;
  status: string;
  submitted_at?: string | null;
  manager_review?: ManagerReview | null;
}

export interface ManagerReview {
  id: string;
  review_period: string;
  rating_manager?: number | null;
  strengths?: string | null;
  improvements?: string | null;
  overall_comment?: string | null;
  final_rating?: number | null;
  status: string;
  reviewed_at?: string | null;
}

export interface Feedback360 {
  id: string;
  review_period: string;
  relationship: string;
  strengths?: string | null;
  improvements?: string | null;
  rating?: number | null;
  is_anonymous: boolean;
  submitted_at?: string | null;
  giver?: { first_name: string | null; last_name: string | null };
}

export interface EmployeeSkill {
  id: string;
  skill_name: string;
  category: string;
  proficiency: string;
}

export interface SkillDevelopmentPlan {
  id: string;
  skill_name: string;
  current_level?: string | null;
  target_level?: string | null;
  action_items?: string | null;
  resources?: string | null;
  target_date?: string | null;
  status: string;
}

// ── Learning — Certificates ───────────────────────────────────────────────────
export interface Certificate {
  id: string;
  cert_name: string;
  issuing_body?: string | null;
  issue_date: string;
  expiry_date?: string | null;
  credential_id?: string | null;
  file_url?: string | null;
  is_verified: boolean;
}

// ── Org ───────────────────────────────────────────────────────────────────────
export interface JobPosting {
  id: string;
  title: string;
  department_id?: string | null;
  description?: string | null;
  requirements?: string | null;
  location?: string | null;
  employment_type: string;
  is_internal: boolean;
  status: string;
  salary_range?: string | null;
  closing_date?: string | null;
  created_at: string;
  department?: { department_name: string } | null;
  applications?: { id: string; status: string; applied_at: string }[];
}

export interface JobApplication {
  id: string;
  status: string;
  cover_note?: string | null;
  applied_at: string;
  job_posting: JobPosting;
}

// ── Onboarding ────────────────────────────────────────────────────────────────
export interface OnboardingTask {
  id: string;
  task_title: string;
  description?: string | null;
  category: string;
  is_mandatory: boolean;
  due_days?: number | null;
}

export interface OnboardingChecklist {
  id: string;
  status: string;
  completed_at?: string | null;
  remarks?: string | null;
  task: OnboardingTask;
}

export interface PolicyAcknowledgement {
  id: string;
  policy_name: string;
  policy_version: string;
  acknowledged_at: string;
}

export interface OnboardingExperience {
  id: string;
  overall_rating?: number | null;
  buddy_rating?: number | null;
  process_rating?: number | null;
  feedback?: string | null;
  submitted_at?: string | null;
}

// ── Offboarding ───────────────────────────────────────────────────────────────
export interface Resignation {
  id: string;
  resignation_date: string;
  last_working_date?: string | null;
  reason?: string | null;
  notice_period_days?: number | null;
  status: string;
  submitted_at: string;
  approvals?: Array<{
    id: string;
    status?: string | null;
    remarks?: string | null;
    approved_at?: string | null;
    approver: { first_name: string | null; last_name: string | null };
  }>;
}

export interface ExitInterview {
  id: string;
  reason_leaving?: string | null;
  job_satisfaction?: number | null;
  manager_rating?: number | null;
  culture_rating?: number | null;
  rehire_eligible: boolean;
  suggestions?: string | null;
  conducted_at?: string | null;
}

export interface FnFSettlement {
  id: string;
  gratuity?: number | null;
  leave_encashment?: number | null;
  bonus?: number | null;
  deductions?: number | null;
  net_payable?: number | null;
  payment_date?: string | null;
  status: string;
  remarks?: string | null;
}
