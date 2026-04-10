-- Add whatsapp_no to employees
ALTER TABLE "employees" ADD COLUMN "whatsapp_no" TEXT;

-- Create salary_structures table
CREATE TABLE "salary_structures" (
    "id"                    TEXT NOT NULL,
    "employee_id"           TEXT NOT NULL,
    "basic_pct"             DECIMAL(5,2) NOT NULL DEFAULT 40,
    "hra_pct"               DECIMAL(5,2) NOT NULL DEFAULT 20,
    "da_pct"                DECIMAL(5,2) NOT NULL DEFAULT 10,
    "special_allowance_pct" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "other_allowance"       DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pf_employee_pct"       DECIMAL(5,2) NOT NULL DEFAULT 12,
    "esi_applicable"        BOOLEAN NOT NULL DEFAULT false,
    "professional_tax"      DECIMAL(8,2) NOT NULL DEFAULT 200,
    "tds_monthly"           DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"            TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "salary_structures_employee_id_key" ON "salary_structures"("employee_id");
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create reimbursements table
CREATE TABLE "reimbursements" (
    "id"          TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "category"    TEXT NOT NULL,
    "amount"      DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "bill_date"   DATE NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'PENDING',
    "applied_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reimbursements_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "reimbursements_employee_id_status_idx" ON "reimbursements"("employee_id", "status");
ALTER TABLE "reimbursements" ADD CONSTRAINT "reimbursements_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create reimbursement_approvals table
CREATE TABLE "reimbursement_approvals" (
    "id"                TEXT NOT NULL,
    "reimbursement_id"  TEXT NOT NULL,
    "approver_id"       TEXT NOT NULL,
    "approval_status"   TEXT,
    "remarks"           TEXT,
    "approved_at"       TIMESTAMP(3),
    CONSTRAINT "reimbursement_approvals_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "reimbursement_approvals" ADD CONSTRAINT "reimbursement_approvals_reimbursement_id_fkey"
    FOREIGN KEY ("reimbursement_id") REFERENCES "reimbursements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reimbursement_approvals" ADD CONSTRAINT "reimbursement_approvals_approver_id_fkey"
    FOREIGN KEY ("approver_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add Indian salary breakdown columns to payroll_records
ALTER TABLE "payroll_records"
    ADD COLUMN "basic"             DECIMAL(12,2),
    ADD COLUMN "hra"               DECIMAL(12,2),
    ADD COLUMN "da"                DECIMAL(12,2),
    ADD COLUMN "special_allowance" DECIMAL(12,2),
    ADD COLUMN "other_allowance"   DECIMAL(12,2),
    ADD COLUMN "pf_employee"       DECIMAL(12,2),
    ADD COLUMN "esi_employee"      DECIMAL(12,2),
    ADD COLUMN "professional_tax"  DECIMAL(12,2),
    ADD COLUMN "tds"               DECIMAL(12,2);
