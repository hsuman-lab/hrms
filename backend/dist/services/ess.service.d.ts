export declare class EssService {
    getAddresses(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        employee_id: string;
        address_type: string;
        line1: string;
        line2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string;
    }[]>;
    upsertAddress(employeeId: string, data: {
        addressType: string;
        line1: string;
        line2?: string;
        city?: string;
        state?: string;
        pincode?: string;
        country?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        employee_id: string;
        address_type: string;
        line1: string;
        line2: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string;
    }>;
    getBankDetail(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        employee_id: string;
        is_verified: boolean;
        bank_name: string;
        account_number: string;
        ifsc_code: string;
        account_type: string;
        branch: string | null;
    } | null>;
    upsertBankDetail(employeeId: string, data: {
        bankName: string;
        accountNumber: string;
        ifscCode: string;
        accountType?: string;
        branch?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        employee_id: string;
        is_verified: boolean;
        bank_name: string;
        account_number: string;
        ifsc_code: string;
        account_type: string;
        branch: string | null;
    }>;
    getEmergencyContacts(employeeId: string): Promise<{
        id: string;
        email: string | null;
        created_at: Date;
        updated_at: Date;
        name: string;
        phone: string;
        employee_id: string;
        relationship: string;
        is_primary: boolean;
    }[]>;
    addEmergencyContact(employeeId: string, data: {
        name: string;
        relationship: string;
        phone: string;
        email?: string;
        isPrimary?: boolean;
    }): Promise<{
        id: string;
        email: string | null;
        created_at: Date;
        updated_at: Date;
        name: string;
        phone: string;
        employee_id: string;
        relationship: string;
        is_primary: boolean;
    }>;
    updateEmergencyContact(id: string, employeeId: string, data: {
        name?: string;
        relationship?: string;
        phone?: string;
        email?: string;
        isPrimary?: boolean;
    }): Promise<{
        id: string;
        email: string | null;
        created_at: Date;
        updated_at: Date;
        name: string;
        phone: string;
        employee_id: string;
        relationship: string;
        is_primary: boolean;
    }>;
    deleteEmergencyContact(id: string, employeeId: string): Promise<{
        success: boolean;
    }>;
    getDocuments(employeeId: string): Promise<{
        id: string;
        employee_id: string;
        file_url: string;
        is_verified: boolean;
        doc_type: string;
        doc_name: string;
        file_size: number | null;
        uploaded_at: Date;
        expires_at: Date | null;
    }[]>;
    addDocument(employeeId: string, data: {
        docType: string;
        docName: string;
        fileUrl: string;
        fileSize?: number;
        expiresAt?: string;
    }): Promise<{
        id: string;
        employee_id: string;
        file_url: string;
        is_verified: boolean;
        doc_type: string;
        doc_name: string;
        file_size: number | null;
        uploaded_at: Date;
        expires_at: Date | null;
    }>;
    deleteDocument(id: string, employeeId: string): Promise<{
        success: boolean;
    }>;
}
declare const _default: EssService;
export default _default;
//# sourceMappingURL=ess.service.d.ts.map