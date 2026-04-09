import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({ where: { role_name: 'EMPLOYEE' }, update: {}, create: { role_name: 'EMPLOYEE', description: 'Regular employee' } }),
    prisma.role.upsert({ where: { role_name: 'EMPLOYEE_MANAGER' }, update: {}, create: { role_name: 'EMPLOYEE_MANAGER', description: 'Team manager' } }),
    prisma.role.upsert({ where: { role_name: 'HR' }, update: {}, create: { role_name: 'HR', description: 'Human Resources staff' } }),
    prisma.role.upsert({ where: { role_name: 'HR_MANAGER' }, update: {}, create: { role_name: 'HR_MANAGER', description: 'HR Manager' } }),
    prisma.role.upsert({ where: { role_name: 'FINANCE' }, update: {}, create: { role_name: 'FINANCE', description: 'Finance team' } }),
  ]);

  const [employeeRole, managerRole, hrRole, hrManagerRole, financeRole] = roles;
  console.log('Roles created');

  // Create departments with fixed IDs so upsert works
  const [engDept, salesDept, hrDept, finDept] = await Promise.all([
    prisma.department.upsert({ where: { id: 'dept-eng-001' }, update: {}, create: { id: 'dept-eng-001', department_name: 'Engineering', description: 'Software Engineering' } }),
    prisma.department.upsert({ where: { id: 'dept-sal-001' }, update: {}, create: { id: 'dept-sal-001', department_name: 'Sales', description: 'Sales & Business Dev' } }),
    prisma.department.upsert({ where: { id: 'dept-hr--001' }, update: {}, create: { id: 'dept-hr--001', department_name: 'Human Resources', description: 'HR Department' } }),
    prisma.department.upsert({ where: { id: 'dept-fin-001' }, update: {}, create: { id: 'dept-fin-001', department_name: 'Finance', description: 'Finance & Accounting' } }),
  ]);
  console.log('Departments created');

  const passwordHash = await bcrypt.hash('password123', 12);

  const createUser = async (email: string, roleId: string, code: string, firstName: string, lastName: string, deptId: string, salary: number, managerId?: string) => {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password_hash: passwordHash, role_id: roleId },
    });
    const emp = await prisma.employee.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id, employee_code: code,
        first_name: firstName, last_name: lastName,
        department_id: deptId, manager_id: managerId,
        joining_date: new Date('2022-01-10'), base_salary: salary,
      },
    });
    return { user, emp };
  };

  const { emp: hrManagerEmp } = await createUser('hrmanager@hrms.com', hrManagerRole.id, 'EMP001', 'Sarah', 'Johnson', hrDept.id, 9000);
  await createUser('hr@hrms.com', hrRole.id, 'EMP002', 'Emily', 'Davis', hrDept.id, 7000);
  await createUser('finance@hrms.com', financeRole.id, 'EMP003', 'Michael', 'Chen', finDept.id, 8000);
  const { emp: managerEmp } = await createUser('manager@hrms.com', managerRole.id, 'EMP004', 'Robert', 'Wilson', engDept.id, 10000);
  const { emp: employeeEmp } = await createUser('employee@hrms.com', employeeRole.id, 'EMP005', 'Alex', 'Taylor', engDept.id, 6000, managerEmp.id);
  console.log('Users & employees created');

  // Leave types with fixed IDs
  const leaveTypes = await Promise.all([
    prisma.leaveType.upsert({ where: { id: 'lt-casual-001' }, update: {}, create: { id: 'lt-casual-001', leave_name: 'Casual Leave', description: 'Personal matters', max_days: 12, is_paid: true, carry_forward: false } }),
    prisma.leaveType.upsert({ where: { id: 'lt-sick--001' }, update: {}, create: { id: 'lt-sick--001', leave_name: 'Sick Leave', description: 'Medical reasons', max_days: 12, is_paid: true, carry_forward: false } }),
    prisma.leaveType.upsert({ where: { id: 'lt-earned-01' }, update: {}, create: { id: 'lt-earned-01', leave_name: 'Earned Leave', description: 'Accrued annual leave', max_days: 20, is_paid: true, carry_forward: true } }),
    prisma.leaveType.upsert({ where: { id: 'lt-wfh---001' }, update: {}, create: { id: 'lt-wfh---001', leave_name: 'Work From Home', description: 'Remote work', max_days: 24, is_paid: true, carry_forward: false } }),
  ]);
  console.log('Leave types created');

  const allEmployees = await prisma.employee.findMany();
  for (const emp of allEmployees) {
    for (const lt of leaveTypes) {
      await prisma.leaveBalance.upsert({
        where: { employee_id_leave_type_id: { employee_id: emp.id, leave_type_id: lt.id } },
        update: {},
        create: { employee_id: emp.id, leave_type_id: lt.id, total_days: lt.max_days ?? 0, used_days: 0, remaining_days: lt.max_days ?? 0 },
      });
    }
  }
  console.log('Leave balances created');

  // Sample attendance for the employee (last 7 weekdays)
  for (let i = 7; i >= 1; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    const attendanceDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const clockIn = new Date(attendanceDate);
    clockIn.setHours(9, Math.floor(Math.random() * 20), 0, 0);
    const clockOut = new Date(attendanceDate);
    clockOut.setHours(17, Math.floor(Math.random() * 30), 0, 0);
    const isLate = clockIn.getHours() > 9 || (clockIn.getHours() === 9 && clockIn.getMinutes() > 10);
    await prisma.attendance.upsert({
      where: { employee_id_attendance_date: { employee_id: employeeEmp.id, attendance_date: attendanceDate } },
      update: {},
      create: { employee_id: employeeEmp.id, attendance_date: attendanceDate, clock_in: clockIn, clock_out: clockOut, status: isLate ? 'LATE' : 'PRESENT' },
    });
  }
  console.log('Sample attendance created');

  // Mandatory L&D courses
  const mandatoryCourses = await Promise.all([
    prisma.course.upsert({
      where: { id: 'course-posh-001' },
      update: {},
      create: { id: 'course-posh-001', title: 'POSH — Prevention of Sexual Harassment', description: 'Mandatory awareness training on Prevention, Prohibition and Redressal of Sexual Harassment at the Workplace (POSH Act 2013).', category: 'COMPLIANCE', is_mandatory: true, duration_mins: 60 },
    }),
    prisma.course.upsert({
      where: { id: 'course-cobc-001' },
      update: {},
      create: { id: 'course-cobc-001', title: 'COBC — Code of Business Conduct', description: 'Code of Business Conduct & Ethics — covering conflict of interest, anti-bribery, confidentiality, and professional standards.', category: 'COMPLIANCE', is_mandatory: true, duration_mins: 45 },
    }),
    prisma.course.upsert({
      where: { id: 'course-it-001' },
      update: {},
      create: { id: 'course-it-001', title: 'IT Mandatory — Information Security Awareness', description: 'Covers password hygiene, phishing awareness, data classification, acceptable use policy, and incident reporting.', category: 'IT_SECURITY', is_mandatory: true, duration_mins: 30 },
    }),
  ]);
  console.log('Mandatory courses created (POSH, COBC, IT Mandatory)');

  // Enroll every employee in every mandatory course
  const allEmployeeIds = (await prisma.employee.findMany({ select: { id: true } })).map((e) => e.id);
  for (const course of mandatoryCourses) {
    await prisma.courseEnrollment.createMany({
      data: allEmployeeIds.map((employee_id) => ({ course_id: course.id, employee_id })),
      skipDuplicates: true,
    });
  }
  console.log('All employees enrolled in mandatory courses');

  console.log('\nSeed complete! Test credentials:');
  console.log('  Employee:    employee@hrms.com   / password123');
  console.log('  Manager:     manager@hrms.com    / password123');
  console.log('  HR:          hr@hrms.com         / password123');
  console.log('  HR Manager:  hrmanager@hrms.com  / password123');
  console.log('  Finance:     finance@hrms.com    / password123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
