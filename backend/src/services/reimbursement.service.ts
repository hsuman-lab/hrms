import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class ReimbursementService {
  async apply(employeeId: string, data: {
    category: string;
    amount: number;
    description: string;
    billDate: string;
  }) {
    return prisma.reimbursement.create({
      data: {
        employee_id: employeeId,
        category:    data.category,
        amount:      data.amount,
        description: data.description,
        bill_date:   new Date(data.billDate),
        status:      'PENDING',
      },
      include: { employee: { select: { first_name: true, last_name: true, employee_code: true } } },
    });
  }

  async getMyReimbursements(employeeId: string) {
    return prisma.reimbursement.findMany({
      where: { employee_id: employeeId },
      include: {
        approvals: {
          include: { approver: { select: { first_name: true, last_name: true } } },
        },
      },
      orderBy: { applied_at: 'desc' },
    });
  }

  /** Pending reimbursements for direct reports of the manager */
  async getPendingForManager(managerId: string) {
    const team = await prisma.employee.findMany({
      where: { manager_id: managerId },
      select: { id: true },
    });
    const ids = team.map((e) => e.id);

    return prisma.reimbursement.findMany({
      where: { employee_id: { in: ids }, status: 'PENDING' },
      include: {
        employee: {
          select: { id: true, first_name: true, last_name: true, employee_code: true, department: true },
        },
      },
      orderBy: { applied_at: 'asc' },
    });
  }

  async approveOrReject(reimbursementId: string, approverId: string, status: 'APPROVED' | 'REJECTED', remarks?: string) {
    const req = await prisma.reimbursement.findUnique({ where: { id: reimbursementId } });
    if (!req) throw new AppError('Reimbursement not found', 404);
    if (req.status !== 'PENDING') throw new AppError('Reimbursement is no longer pending', 400);

    // Verify approver is actually the reporting manager
    const employee = await prisma.employee.findUnique({
      where: { id: req.employee_id },
      select: { manager_id: true },
    });
    if (employee?.manager_id !== approverId) {
      throw new AppError('Only the reporting manager can approve this reimbursement', 403);
    }

    await prisma.$transaction(async (tx) => {
      await tx.reimbursement.update({ where: { id: reimbursementId }, data: { status } });
      await tx.reimbursementApproval.create({
        data: {
          reimbursement_id: reimbursementId,
          approver_id:      approverId,
          approval_status:  status,
          remarks,
          approved_at:      new Date(),
        },
      });
    });

    return { success: true, message: `Reimbursement ${status.toLowerCase()} successfully` };
  }

  /** HR: all reimbursements */
  async getAllForHR(status?: string) {
    return prisma.reimbursement.findMany({
      where: status ? { status } : undefined,
      include: {
        employee: {
          select: { id: true, first_name: true, last_name: true, employee_code: true, department: true },
        },
        approvals: {
          include: { approver: { select: { first_name: true, last_name: true } } },
        },
      },
      orderBy: { applied_at: 'desc' },
    });
  }
}

export default new ReimbursementService();
