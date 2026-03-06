import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

const LATE_THRESHOLD_HOUR = 9;
const LATE_THRESHOLD_MINUTE = 15;

export class AttendanceService {
  async clockIn(employeeId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const existing = await prisma.attendance.findUnique({
      where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
    });

    if (existing?.clock_in) {
      throw new AppError('Already clocked in today', 400);
    }

    const isLate =
      now.getHours() > LATE_THRESHOLD_HOUR ||
      (now.getHours() === LATE_THRESHOLD_HOUR && now.getMinutes() > LATE_THRESHOLD_MINUTE);

    if (existing) {
      return prisma.attendance.update({
        where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
        data: { clock_in: now, status: isLate ? 'LATE' : 'PRESENT' },
      });
    }

    return prisma.attendance.create({
      data: {
        employee_id: employeeId,
        attendance_date: today,
        clock_in: now,
        status: isLate ? 'LATE' : 'PRESENT',
      },
    });
  }

  async clockOut(employeeId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const record = await prisma.attendance.findUnique({
      where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
    });

    if (!record?.clock_in) throw new AppError('Must clock in before clocking out', 400);
    if (record.clock_out) throw new AppError('Already clocked out today', 400);

    const clockInTime = record.clock_in!;
    const hoursWorked = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    const status = hoursWorked < 4 ? 'HALF_DAY' : record.status || 'PRESENT';

    return prisma.attendance.update({
      where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
      data: { clock_out: now, status },
    });
  }

  async getAttendanceHistory(employeeId: string, startDate?: string, endDate?: string, page = 1, limit = 30) {
    const skip = (page - 1) * limit;
    const where: { employee_id: string; attendance_date?: { gte?: Date; lte?: Date } } = { employee_id: employeeId };

    if (startDate || endDate) {
      where.attendance_date = {};
      if (startDate) where.attendance_date.gte = new Date(startDate);
      if (endDate) where.attendance_date.lte = new Date(endDate);
    }

    const [records, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { attendance_date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    return { records, total, page, limit };
  }

  async getTodayStatus(employeeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.attendance.findUnique({
      where: { employee_id_attendance_date: { employee_id: employeeId, attendance_date: today } },
    });
  }

  async getTeamAttendance(managerId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const teamMembers = await prisma.employee.findMany({
      where: { manager_id: managerId },
      select: { id: true, first_name: true, last_name: true, employee_code: true },
    });

    const attendance = await prisma.attendance.findMany({
      where: {
        employee_id: { in: teamMembers.map((m) => m.id) },
        attendance_date: targetDate,
      },
    });

    return teamMembers.map((member) => ({
      ...member,
      attendance: attendance.find((a) => a.employee_id === member.id) || null,
    }));
  }

  async getMonthlyReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return prisma.attendance.findMany({
      where: {
        attendance_date: { gte: startDate, lte: endDate },
      },
      include: {
        employee: {
          select: { id: true, first_name: true, last_name: true, employee_code: true, department: true },
        },
      },
      orderBy: [{ employee_id: 'asc' }, { attendance_date: 'asc' }],
    });
  }
}

export default new AttendanceService();
