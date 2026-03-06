import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

const getWorkingDays = (start: Date, end: Date): number => {
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

export class LeaveService {
  async applyLeave(employeeId: string, data: {
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (start > end) throw new AppError('Start date must be before end date', 400);

    const totalDays = getWorkingDays(start, end);

    const balance = await prisma.leaveBalance.findUnique({
      where: { employee_id_leave_type_id: { employee_id: employeeId, leave_type_id: data.leaveTypeId } },
    });

    if (!balance) throw new AppError('Leave type not configured for this employee', 400);
    if ((balance.remaining_days ?? 0) < totalDays) {
      throw new AppError(`Insufficient leave balance. Available: ${balance.remaining_days} days`, 400);
    }

    // Check for overlapping requests
    const overlap = await prisma.leaveRequest.findFirst({
      where: {
        employee_id: employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { start_date: { lte: end }, end_date: { gte: start } },
        ],
      },
    });
    if (overlap) throw new AppError('You have an overlapping leave request', 400);

    return prisma.leaveRequest.create({
      data: {
        employee_id: employeeId,
        leave_type_id: data.leaveTypeId,
        start_date: start,
        end_date: end,
        total_days: totalDays,
        reason: data.reason,
        status: 'PENDING',
      },
      include: { leave_type: true },
    });
  }

  async getMyLeaves(employeeId: string, status?: string) {
    return prisma.leaveRequest.findMany({
      where: {
        employee_id: employeeId,
        ...(status && { status }),
      },
      include: {
        leave_type: true,
        approvals: {
          include: { approver: { select: { first_name: true, last_name: true } } },
        },
      },
      orderBy: { applied_at: 'desc' },
    });
  }

  async getLeaveBalance(employeeId: string) {
    return prisma.leaveBalance.findMany({
      where: { employee_id: employeeId },
      include: { leave_type: true },
    });
  }

  async getPendingApprovalsForManager(managerId: string) {
    const team = await prisma.employee.findMany({
      where: { manager_id: managerId },
      select: { id: true },
    });
    const teamIds = team.map((e) => e.id);

    return prisma.leaveRequest.findMany({
      where: { employee_id: { in: teamIds }, status: 'PENDING' },
      include: {
        employee: { select: { id: true, first_name: true, last_name: true, employee_code: true, department: true } },
        leave_type: true,
      },
      orderBy: { applied_at: 'asc' },
    });
  }

  async approveOrRejectLeave(leaveRequestId: string, approverId: string, status: 'APPROVED' | 'REJECTED', remarks?: string) {
    const request = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      include: { leave_type: true },
    });

    if (!request) throw new AppError('Leave request not found', 404);
    if (request.status !== 'PENDING') throw new AppError('Leave request is no longer pending', 400);

    await prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({ where: { id: leaveRequestId }, data: { status } });
      await tx.leaveApproval.create({
        data: {
          leave_request_id: leaveRequestId,
          approver_id: approverId,
          approval_status: status,
          remarks,
          approved_at: new Date(),
        },
      });

      if (status === 'APPROVED') {
        await tx.leaveBalance.update({
          where: {
            employee_id_leave_type_id: {
              employee_id: request.employee_id,
              leave_type_id: request.leave_type_id,
            },
          },
          data: {
            used_days: { increment: request.total_days ?? 0 },
            remaining_days: { decrement: request.total_days ?? 0 },
          },
        });
      }
    });

    return { success: true, message: `Leave ${status.toLowerCase()} successfully` };
  }

  async getAllLeaveTypes() {
    return prisma.leaveType.findMany({ orderBy: { leave_name: 'asc' } });
  }

  async createLeaveType(data: {
    leaveName: string;
    description?: string;
    maxDays: number;
    isPaid: boolean;
    carryForward: boolean;
    createdBy: string;
  }) {
    const leaveType = await prisma.leaveType.create({
      data: {
        leave_name: data.leaveName,
        description: data.description,
        max_days: data.maxDays,
        is_paid: data.isPaid,
        carry_forward: data.carryForward,
        created_by: data.createdBy,
      },
    });

    // Initialize balance for all existing employees
    const employees = await prisma.employee.findMany({ select: { id: true } });
    await prisma.leaveBalance.createMany({
      data: employees.map((emp) => ({
        employee_id: emp.id,
        leave_type_id: leaveType.id,
        total_days: data.maxDays,
        used_days: 0,
        remaining_days: data.maxDays,
      })),
      skipDuplicates: true,
    });

    return leaveType;
  }

  async updateLeaveType(id: string, data: {
    leaveName?: string;
    description?: string;
    maxDays?: number;
    isPaid?: boolean;
    carryForward?: boolean;
  }) {
    return prisma.leaveType.update({
      where: { id },
      data: {
        leave_name: data.leaveName,
        description: data.description,
        max_days: data.maxDays,
        is_paid: data.isPaid,
        carry_forward: data.carryForward,
      },
    });
  }

  async getAllLeavesForHR(status?: string, month?: number, year?: number) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (month && year) {
      where.applied_at = {
        gte: new Date(year, month - 1, 1),
        lte: new Date(year, month, 0),
      };
    }

    return prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: { id: true, first_name: true, last_name: true, employee_code: true, department: true },
        },
        leave_type: true,
        approvals: {
          include: { approver: { select: { first_name: true, last_name: true } } },
        },
      },
      orderBy: { applied_at: 'desc' },
    });
  }
}

export default new LeaveService();
