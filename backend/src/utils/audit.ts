import prisma from '../config/database';

export const logAudit = async (
  userId: string | undefined,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) => {
  try {
    await prisma.auditLog.create({
      data: { user_id: userId, action, entity_type: entityType, entity_id: entityId, metadata },
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
};
