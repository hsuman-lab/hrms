import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class EmployeeService {
  async getAllEmployees(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { email: true, role: true, is_active: true } },
          department: true,
          manager: { select: { id: true, first_name: true, last_name: true, employee_code: true } },
        },
        orderBy: { employee_code: 'asc' },
      }),
      prisma.employee.count(),
    ]);
    return { employees, total, page, limit };
  }

  async getEmployeeById(id: string) {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true, is_active: true } },
        department: true,
        manager: { select: { id: true, first_name: true, last_name: true, employee_code: true } },
        leave_balances: { include: { leave_type: true } },
      },
    });
    if (!employee) throw new AppError('Employee not found', 404);
    return employee;
  }

  async getMyProfile(userId: string) {
    const employee = await prisma.employee.findUnique({
      where: { user_id: userId },
      include: {
        user: { select: { email: true, role: true } },
        department: true,
        manager: { select: { id: true, first_name: true, last_name: true, employee_code: true } },
        leave_balances: { include: { leave_type: true } },
      },
    });
    if (!employee) throw new AppError('Employee profile not found', 404);
    return employee;
  }

  async createEmployee(data: {
    email: string;
    password: string;
    roleId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    whatsappNo?: string;
    departmentId?: string;
    managerId?: string;
    joiningDate?: string;
    baseSalary?: number;
    employeeCode: string;
    salaryStructure?: {
      basicPct?: number; hraPct?: number; daPct?: number;
      specialAllowancePct?: number; otherAllowance?: number;
      pfEmployeePct?: number; esiApplicable?: boolean;
      professionalTax?: number; tdsMonthly?: number;
    };
  }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new AppError('Email already registered', 409);

    const hash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash: hash,
        role_id: data.roleId,
      },
    });

    const employee = await prisma.employee.create({
      data: {
        user_id: user.id,
        employee_code: data.employeeCode,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        whatsapp_no: data.whatsappNo,
        department_id: data.departmentId,
        manager_id: data.managerId,
        joining_date: data.joiningDate ? new Date(data.joiningDate) : undefined,
        base_salary: data.baseSalary,
      },
      include: { user: { select: { email: true, role: true } }, department: true },
    });

    // Initialize salary structure (default Indian structure)
    const ss = data.salaryStructure ?? {};
    await prisma.salaryStructure.create({
      data: {
        employee_id: employee.id,
        basic_pct:              ss.basicPct             ?? 40,
        hra_pct:                ss.hraPct               ?? 20,
        da_pct:                 ss.daPct                ?? 10,
        special_allowance_pct:  ss.specialAllowancePct  ?? 20,
        other_allowance:        ss.otherAllowance       ?? 0,
        pf_employee_pct:        ss.pfEmployeePct        ?? 12,
        esi_applicable:         ss.esiApplicable        ?? false,
        professional_tax:       ss.professionalTax      ?? 200,
        tds_monthly:            ss.tdsMonthly           ?? 0,
      },
    });

    // Initialize leave balances
    const leaveTypes = await prisma.leaveType.findMany();
    await prisma.leaveBalance.createMany({
      data: leaveTypes.map((lt) => ({
        employee_id: employee.id,
        leave_type_id: lt.id,
        total_days: lt.max_days ?? 0,
        used_days: 0,
        remaining_days: lt.max_days ?? 0,
      })),
      skipDuplicates: true,
    });

    // Enroll in mandatory L&D courses
    const mandatoryCourses = await prisma.course.findMany({ where: { is_mandatory: true }, select: { id: true } });
    if (mandatoryCourses.length > 0) {
      await prisma.courseEnrollment.createMany({
        data: mandatoryCourses.map((c) => ({ course_id: c.id, employee_id: employee.id })),
        skipDuplicates: true,
      });
    }

    return employee;
  }

  async updateSalaryStructure(employeeId: string, data: {
    basicPct?: number; hraPct?: number; daPct?: number;
    specialAllowancePct?: number; otherAllowance?: number;
    pfEmployeePct?: number; esiApplicable?: boolean;
    professionalTax?: number; tdsMonthly?: number;
  }) {
    return prisma.salaryStructure.upsert({
      where: { employee_id: employeeId },
      update: {
        basic_pct:              data.basicPct,
        hra_pct:                data.hraPct,
        da_pct:                 data.daPct,
        special_allowance_pct:  data.specialAllowancePct,
        other_allowance:        data.otherAllowance,
        pf_employee_pct:        data.pfEmployeePct,
        esi_applicable:         data.esiApplicable,
        professional_tax:       data.professionalTax,
        tds_monthly:            data.tdsMonthly,
      },
      create: {
        employee_id:            employeeId,
        basic_pct:              data.basicPct             ?? 40,
        hra_pct:                data.hraPct               ?? 20,
        da_pct:                 data.daPct                ?? 10,
        special_allowance_pct:  data.specialAllowancePct  ?? 20,
        other_allowance:        data.otherAllowance       ?? 0,
        pf_employee_pct:        data.pfEmployeePct        ?? 12,
        esi_applicable:         data.esiApplicable        ?? false,
        professional_tax:       data.professionalTax      ?? 200,
        tds_monthly:            data.tdsMonthly           ?? 0,
      },
    });
  }

  async updateEmployee(id: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    departmentId?: string;
    managerId?: string;
    employmentStatus?: string;
    baseSalary?: number;
  }) {
    return prisma.employee.update({
      where: { id },
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        department_id: data.departmentId,
        manager_id: data.managerId,
        employment_status: data.employmentStatus,
        base_salary: data.baseSalary,
      },
      include: { department: true, user: { select: { email: true, role: true } } },
    });
  }

  async getTeamMembers(managerId: string) {
    return prisma.employee.findMany({
      where: { manager_id: managerId },
      include: {
        user: { select: { email: true, role: true } },
        department: true,
      },
    });
  }

  async getDashboardStats(employeeId: string) {
    const today = new Date();
    const thisMonth = { gte: new Date(today.getFullYear(), today.getMonth(), 1), lte: today };

    const [attendanceCount, pendingLeave, leaveBalances, todayAttendance] = await Promise.all([
      prisma.attendance.count({
        where: { employee_id: employeeId, attendance_date: thisMonth, status: { in: ['PRESENT', 'LATE'] } },
      }),
      prisma.leaveRequest.count({ where: { employee_id: employeeId, status: 'PENDING' } }),
      prisma.leaveBalance.findMany({
        where: { employee_id: employeeId },
        include: { leave_type: true },
      }),
      prisma.attendance.findFirst({
        where: { employee_id: employeeId, attendance_date: today },
      }),
    ]);

    return { attendanceCount, pendingLeave, leaveBalances, todayAttendance };
  }
}

export default new EmployeeService();
