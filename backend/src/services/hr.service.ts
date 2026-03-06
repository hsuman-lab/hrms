import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class HRService {
  async getAllDepartments() {
    return prisma.department.findMany({
      include: { _count: { select: { employees: true } } },
      orderBy: { department_name: 'asc' },
    });
  }

  async createDepartment(name: string, description?: string) {
    return prisma.department.create({ data: { department_name: name, description } });
  }

  async updateDepartment(id: string, name?: string, description?: string) {
    return prisma.department.update({
      where: { id },
      data: { department_name: name, description },
    });
  }

  async deleteDepartment(id: string) {
    const hasEmployees = await prisma.employee.count({ where: { department_id: id } });
    if (hasEmployees) throw new AppError('Cannot delete department with active employees', 400);
    return prisma.department.delete({ where: { id } });
  }

  async getAllRoles() {
    return prisma.role.findMany({ orderBy: { role_name: 'asc' } });
  }

  async getOrgAnalytics() {
    const [totalEmployees, byDepartment, byRole, attendanceToday, pendingLeaves] = await Promise.all([
      prisma.employee.count({ where: { employment_status: 'ACTIVE' } }),
      prisma.employee.groupBy({
        by: ['department_id'],
        where: { employment_status: 'ACTIVE' },
        _count: { id: true },
      }),
      prisma.user.groupBy({ by: ['role_id'], _count: { id: true } }),
      prisma.attendance.count({
        where: {
          attendance_date: (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })(),
          status: { in: ['PRESENT', 'LATE'] },
        },
      }),
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
    ]);

    // Get department names
    const departments = await prisma.department.findMany({ select: { id: true, department_name: true } });
    const departmentMap = Object.fromEntries(departments.map((d) => [d.id, d.department_name]));

    const roles = await prisma.role.findMany({ select: { id: true, role_name: true } });
    const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.role_name]));

    return {
      totalEmployees,
      attendanceToday,
      pendingLeaves,
      byDepartment: byDepartment.map((d) => ({
        department: d.department_id ? departmentMap[d.department_id] : 'Unassigned',
        count: d._count.id,
      })),
      byRole: byRole.map((r) => ({
        role: r.role_id ? roleMap[r.role_id] : 'No Role',
        count: r._count.id,
      })),
    };
  }

  async updateUserRole(userId: string, roleId: string) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new AppError('Role not found', 404);
    return prisma.user.update({ where: { id: userId }, data: { role_id: roleId } });
  }

  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    return prisma.user.update({ where: { id: userId }, data: { is_active: !user.is_active } });
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        include: { user: { select: { email: true } } },
        orderBy: { created_at: 'desc' },
      }),
      prisma.auditLog.count(),
    ]);
    return { logs, total, page, limit };
  }
}

export default new HRService();
