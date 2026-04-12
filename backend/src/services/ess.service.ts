import prisma from '../config/database';
import { AppError } from '../middlewares/errorHandler';

export class EssService {
  // ── Addresses ──────────────────────────────────────────────────────────────
  async getAddresses(employeeId: string) {
    return prisma.employeeAddress.findMany({ where: { employee_id: employeeId } });
  }

  async upsertAddress(employeeId: string, data: {
    addressType: string;
    line1: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  }) {
    const existing = await prisma.employeeAddress.findFirst({
      where: { employee_id: employeeId, address_type: data.addressType },
    });
    if (existing) {
      return prisma.employeeAddress.update({
        where: { id: existing.id },
        data: {
          line1: data.line1,
          line2: data.line2,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          country: data.country || 'India',
        },
      });
    }
    return prisma.employeeAddress.create({
      data: {
        employee_id: employeeId,
        address_type: data.addressType,
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        country: data.country || 'India',
      },
    });
  }

  // ── Bank Details ────────────────────────────────────────────────────────────
  async getBankDetail(employeeId: string) {
    return prisma.bankDetail.findUnique({ where: { employee_id: employeeId } });
  }

  async upsertBankDetail(employeeId: string, data: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountType?: string;
    branch?: string;
  }) {
    const existing = await prisma.bankDetail.findUnique({ where: { employee_id: employeeId } });
    if (existing) {
      return prisma.bankDetail.update({
        where: { employee_id: employeeId },
        data: {
          bank_name: data.bankName,
          account_number: data.accountNumber,
          ifsc_code: data.ifscCode,
          account_type: data.accountType || 'SAVINGS',
          branch: data.branch,
          is_verified: false, // reset verification on update
        },
      });
    }
    return prisma.bankDetail.create({
      data: {
        employee_id: employeeId,
        bank_name: data.bankName,
        account_number: data.accountNumber,
        ifsc_code: data.ifscCode,
        account_type: data.accountType || 'SAVINGS',
        branch: data.branch,
      },
    });
  }

  // ── Emergency Contacts ─────────────────────────────────────────────────────
  async getEmergencyContacts(employeeId: string) {
    return prisma.emergencyContact.findMany({ where: { employee_id: employeeId } });
  }

  async addEmergencyContact(employeeId: string, data: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    isPrimary?: boolean;
  }) {
    if (data.isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { employee_id: employeeId },
        data: { is_primary: false },
      });
    }
    return prisma.emergencyContact.create({
      data: {
        employee_id: employeeId,
        name: data.name,
        relationship: data.relationship,
        phone: data.phone,
        email: data.email,
        is_primary: data.isPrimary || false,
      },
    });
  }

  async updateEmergencyContact(id: string, employeeId: string, data: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
  }) {
    const contact = await prisma.emergencyContact.findUnique({ where: { id } });
    if (!contact || contact.employee_id !== employeeId) throw new AppError('Contact not found', 404);
    if (data.isPrimary) {
      await prisma.emergencyContact.updateMany({
        where: { employee_id: employeeId },
        data: { is_primary: false },
      });
    }
    return prisma.emergencyContact.update({
      where: { id },
      data: {
        name: data.name,
        relationship: data.relationship,
        phone: data.phone,
        email: data.email,
        is_primary: data.isPrimary,
      },
    });
  }

  async deleteEmergencyContact(id: string, employeeId: string) {
    const contact = await prisma.emergencyContact.findUnique({ where: { id } });
    if (!contact || contact.employee_id !== employeeId) throw new AppError('Contact not found', 404);
    await prisma.emergencyContact.delete({ where: { id } });
    return { success: true };
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  async getDocuments(employeeId: string) {
    return prisma.employeeDocument.findMany({
      where: { employee_id: employeeId },
      orderBy: { uploaded_at: 'desc' },
    });
  }

  async addDocument(employeeId: string, data: {
    docType: string;
    docName: string;
    fileUrl: string;
    fileSize?: number;
    expiresAt?: string;
  }) {
    return prisma.employeeDocument.create({
      data: {
        employee_id: employeeId,
        doc_type: data.docType,
        doc_name: data.docName,
        file_url: data.fileUrl,
        file_size: data.fileSize,
        expires_at: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async deleteDocument(id: string, employeeId: string) {
    const doc = await prisma.employeeDocument.findUnique({ where: { id } });
    if (!doc || doc.employee_id !== employeeId) throw new AppError('Document not found', 404);
    await prisma.employeeDocument.delete({ where: { id } });
    return { success: true };
  }
}

export default new EssService();
