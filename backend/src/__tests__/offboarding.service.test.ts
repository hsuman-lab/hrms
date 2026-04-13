import { OffboardingService } from '../services/offboarding.service';
import { AppError } from '../middlewares/errorHandler';

// ── Mock Prisma ───────────────────────────────────────────────────────────────
jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    resignation: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    resignationApproval: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
    exitInterview: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    fnFSettlement: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    offboardingTask: {
      findMany: jest.fn(),
    },
    offboardingChecklist: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((fn: (tx: unknown) => Promise<unknown>) => fn({
      resignationApproval: { update: jest.fn() },
      resignation: { update: jest.fn() },
    })),
  },
}));

import prisma from '../config/database';

const prismaMock = prisma as jest.Mocked<typeof prisma>;

// ─────────────────────────────────────────────────────────────────────────────

describe('OffboardingService', () => {
  let service: OffboardingService;

  beforeEach(() => {
    service = new OffboardingService();
    jest.clearAllMocks();
  });

  // ── getMyResignation ────────────────────────────────────────────────────────
  describe('getMyResignation', () => {
    it('returns resignation with approvals when found', async () => {
      const mock = { id: 'r1', status: 'PENDING', approvals: [], employee_id: 'emp1' };
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue(mock);

      const result = await service.getMyResignation('emp1');

      expect(prismaMock.resignation.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { employee_id: 'emp1' } })
      );
      expect(result).toEqual(mock);
    });

    it('returns null when no resignation exists', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.getMyResignation('emp1');
      expect(result).toBeNull();
    });
  });

  // ── submitResignation ───────────────────────────────────────────────────────
  describe('submitResignation', () => {
    const payload = {
      resignationDate: '2026-05-01',
      reason: 'Work-Life Balance',
      noticePeriodDays: 30,
    };

    it('creates a new resignation with PENDING status', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.employee.findUnique as jest.Mock).mockResolvedValue({ id: 'emp1', manager_id: null });
      const created = { id: 'r1', status: 'PENDING', employee_id: 'emp1' };
      (prismaMock.resignation.upsert as jest.Mock).mockResolvedValue(created);

      const result = await service.submitResignation('emp1', payload);

      expect(prismaMock.resignation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            employee_id: 'emp1',
            status: 'PENDING',
            reason: 'Work-Life Balance',
            notice_period_days: 30,
          }),
        })
      );
      expect(result).toEqual(created);
    });

    it('stores the resignation reason correctly for each RESIGNATION_REASONS category', async () => {
      const categories = [
        'Personal', 'Health', 'Medical', 'Compensation',
        'Monetary Gain', 'Work-Life Balance', 'Work Environment',
        'Learning & Growth', 'Others',
      ];

      for (const reason of categories) {
        jest.clearAllMocks();
        (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue(null);
        (prismaMock.employee.findUnique as jest.Mock).mockResolvedValue({ id: 'emp1', manager_id: null });
        (prismaMock.resignation.upsert as jest.Mock).mockResolvedValue({ id: 'r1', status: 'PENDING', reason });

        const result = await service.submitResignation('emp1', { resignationDate: '2026-05-01', reason });

        expect(prismaMock.resignation.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            create: expect.objectContaining({ reason }),
          })
        );
        expect(result.reason).toBe(reason);
      }
    });

    it('throws 400 if an active resignation already exists', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue({ id: 'r1', status: 'PENDING' });

      await expect(service.submitResignation('emp1', payload))
        .rejects.toMatchObject({ statusCode: 400, message: 'Resignation already submitted' });
    });

    it('allows resubmission after a WITHDRAWN resignation', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue({ id: 'r1', status: 'WITHDRAWN' });
      (prismaMock.employee.findUnique as jest.Mock).mockResolvedValue({ id: 'emp1', manager_id: null });
      const updated = { id: 'r1', status: 'PENDING' };
      (prismaMock.resignation.upsert as jest.Mock).mockResolvedValue(updated);

      const result = await service.submitResignation('emp1', payload);
      expect(result.status).toBe('PENDING');
    });

    it('throws 404 if employee does not exist', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.employee.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.submitResignation('emp-ghost', payload))
        .rejects.toMatchObject({ statusCode: 404, message: 'Employee not found' });
    });

    it('creates manager approval record when manager exists', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaMock.employee.findUnique as jest.Mock).mockResolvedValue({ id: 'emp1', manager_id: 'mgr1' });
      (prismaMock.resignation.upsert as jest.Mock).mockResolvedValue({ id: 'r1', status: 'PENDING' });
      (prismaMock.resignationApproval.findFirst as jest.Mock).mockResolvedValue(null);
      (prismaMock.resignationApproval.upsert as jest.Mock).mockRejectedValue(new Error('upsert failed'));
      (prismaMock.resignationApproval.create as jest.Mock).mockResolvedValue({});

      await service.submitResignation('emp1', payload);

      expect(prismaMock.resignationApproval.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ approver_id: 'mgr1', status: 'PENDING' }),
        })
      );
    });
  });

  // ── withdrawResignation ─────────────────────────────────────────────────────
  describe('withdrawResignation', () => {
    it('sets status to WITHDRAWN for a PENDING resignation', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue({ id: 'r1', status: 'PENDING' });
      (prismaMock.resignation.update as jest.Mock).mockResolvedValue({ id: 'r1', status: 'WITHDRAWN' });

      const result = await service.withdrawResignation('emp1');

      expect(prismaMock.resignation.update).toHaveBeenCalledWith({
        where: { employee_id: 'emp1' },
        data: { status: 'WITHDRAWN' },
      });
      expect(result.status).toBe('WITHDRAWN');
    });

    it('throws 404 if no resignation found', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.withdrawResignation('emp1'))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 400 when trying to withdraw an APPROVED resignation', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue({ id: 'r1', status: 'APPROVED' });

      await expect(service.withdrawResignation('emp1'))
        .rejects.toMatchObject({ statusCode: 400, message: 'Cannot withdraw an approved resignation' });
    });
  });

  // ── submitExitInterview ─────────────────────────────────────────────────────
  describe('submitExitInterview', () => {
    const interviewData = {
      reasonLeaving: 'Compensation',
      jobSatisfaction: 3,
      managerRating: 4,
      cultureRating: 3,
      rehireEligible: true,
      suggestions: 'Better pay packages',
    };

    it('creates exit interview linked to existing resignation', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue({ id: 'r1', employee_id: 'emp1' });
      const mock = { id: 'ei1', employee_id: 'emp1', ...interviewData };
      (prismaMock.exitInterview.upsert as jest.Mock).mockResolvedValue(mock);

      const result = await service.submitExitInterview('emp1', interviewData);

      expect(prismaMock.exitInterview.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            employee_id: 'emp1',
            resignation_id: 'r1',
            reason_leaving: 'Compensation',
            job_satisfaction: 3,
          }),
        })
      );
      expect(result).toEqual(mock);
    });

    it('throws 404 if no resignation exists when submitting exit interview', async () => {
      (prismaMock.resignation.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.submitExitInterview('emp1', interviewData))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── updateOffboardingItem ───────────────────────────────────────────────────
  describe('updateOffboardingItem', () => {
    it('marks a checklist item as COMPLETED and sets completed_at', async () => {
      (prismaMock.offboardingChecklist.findUnique as jest.Mock).mockResolvedValue({ id: 'ci1', employee_id: 'emp1' });
      (prismaMock.offboardingChecklist.update as jest.Mock).mockResolvedValue({ id: 'ci1', status: 'COMPLETED' });

      const result = await service.updateOffboardingItem('ci1', 'emp1', { status: 'COMPLETED' });

      expect(prismaMock.offboardingChecklist.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED', completed_at: expect.any(Date) }),
        })
      );
      expect(result.status).toBe('COMPLETED');
    });

    it('throws 404 if item belongs to a different employee', async () => {
      (prismaMock.offboardingChecklist.findUnique as jest.Mock).mockResolvedValue({ id: 'ci1', employee_id: 'other-emp' });

      await expect(service.updateOffboardingItem('ci1', 'emp1', { status: 'COMPLETED' }))
        .rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 404 if item does not exist', async () => {
      (prismaMock.offboardingChecklist.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateOffboardingItem('bad-id', 'emp1', { status: 'COMPLETED' }))
        .rejects.toMatchObject({ statusCode: 404 });
    });
  });

  // ── getFnFSettlement ────────────────────────────────────────────────────────
  describe('getFnFSettlement', () => {
    it('returns null when no F&F settlement has been processed', async () => {
      (prismaMock.fnFSettlement.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.getFnFSettlement('emp1');
      expect(result).toBeNull();
    });

    it('returns settlement with all fields', async () => {
      const mock = { id: 'fnf1', gratuity: 50000, leave_encashment: 20000, net_payable: 70000, status: 'PENDING' };
      (prismaMock.fnFSettlement.findUnique as jest.Mock).mockResolvedValue(mock);
      const result = await service.getFnFSettlement('emp1');
      expect(result).toEqual(mock);
    });
  });
});
