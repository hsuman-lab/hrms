-- ── ESS — Employee Self Service ──────────────────────────────────────────────

CREATE TABLE "employee_addresses" (
    "id"           TEXT NOT NULL,
    "employee_id"  TEXT NOT NULL,
    "address_type" TEXT NOT NULL DEFAULT 'CURRENT',
    "line1"        TEXT NOT NULL,
    "line2"        TEXT,
    "city"         TEXT,
    "state"        TEXT,
    "pincode"      TEXT,
    "country"      TEXT NOT NULL DEFAULT 'India',
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_addresses_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "employee_addresses_employee_id_idx" ON "employee_addresses"("employee_id");
ALTER TABLE "employee_addresses" ADD CONSTRAINT "employee_addresses_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "bank_details" (
    "id"             TEXT NOT NULL,
    "employee_id"    TEXT NOT NULL,
    "bank_name"      TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "ifsc_code"      TEXT NOT NULL,
    "account_type"   TEXT NOT NULL DEFAULT 'SAVINGS',
    "branch"         TEXT,
    "is_verified"    BOOLEAN NOT NULL DEFAULT false,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bank_details_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "bank_details_employee_id_key" ON "bank_details"("employee_id");
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "emergency_contacts" (
    "id"           TEXT NOT NULL,
    "employee_id"  TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone"        TEXT NOT NULL,
    "email"        TEXT,
    "is_primary"   BOOLEAN NOT NULL DEFAULT false,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "emergency_contacts_employee_id_idx" ON "emergency_contacts"("employee_id");
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "employee_documents" (
    "id"          TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "doc_type"    TEXT NOT NULL,
    "doc_name"    TEXT NOT NULL,
    "file_url"    TEXT NOT NULL,
    "file_size"   INTEGER,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at"  TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "employee_documents_employee_id_doc_type_idx" ON "employee_documents"("employee_id", "doc_type");
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── PMS — Performance Management ─────────────────────────────────────────────

CREATE TABLE "performance_goals" (
    "id"             TEXT NOT NULL,
    "employee_id"    TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "description"    TEXT,
    "goal_type"      TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "metric_type"    TEXT NOT NULL DEFAULT 'OKR',
    "target_value"   TEXT,
    "achieved_value" TEXT,
    "weightage"      DECIMAL(5,2),
    "due_date"       DATE,
    "status"         TEXT NOT NULL DEFAULT 'ACTIVE',
    "progress_pct"   INTEGER NOT NULL DEFAULT 0,
    "cycle"          TEXT,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "performance_goals_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "performance_goals_employee_id_status_idx" ON "performance_goals"("employee_id", "status");
ALTER TABLE "performance_goals" ADD CONSTRAINT "performance_goals_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "self_assessments" (
    "id"             TEXT NOT NULL,
    "employee_id"    TEXT NOT NULL,
    "review_cycle"   TEXT NOT NULL,
    "overall_rating" INTEGER,
    "strengths"      TEXT,
    "improvements"   TEXT,
    "goals_next"     TEXT,
    "status"         TEXT NOT NULL DEFAULT 'DRAFT',
    "submitted_at"   TIMESTAMP(3),
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "self_assessments_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "self_assessments_employee_id_review_cycle_key" ON "self_assessments"("employee_id", "review_cycle");
ALTER TABLE "self_assessments" ADD CONSTRAINT "self_assessments_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "manager_reviews" (
    "id"             TEXT NOT NULL,
    "reviewer_id"    TEXT NOT NULL,
    "reviewee_id"    TEXT NOT NULL,
    "review_cycle"   TEXT NOT NULL,
    "overall_rating" INTEGER,
    "comments"       TEXT,
    "strengths"      TEXT,
    "improvements"   TEXT,
    "status"         TEXT NOT NULL DEFAULT 'PENDING',
    "submitted_at"   TIMESTAMP(3),
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "manager_reviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "manager_reviews_reviewer_id_reviewee_id_review_cycle_key" ON "manager_reviews"("reviewer_id", "reviewee_id", "review_cycle");
ALTER TABLE "manager_reviews" ADD CONSTRAINT "manager_reviews_reviewer_id_fkey"
    FOREIGN KEY ("reviewer_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "manager_reviews" ADD CONSTRAINT "manager_reviews_reviewee_id_fkey"
    FOREIGN KEY ("reviewee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "feedback_360" (
    "id"          TEXT NOT NULL,
    "giver_id"    TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "cycle"       TEXT,
    "rating"      INTEGER,
    "feedback"    TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feedback_360_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "feedback_360_receiver_id_idx" ON "feedback_360"("receiver_id");
ALTER TABLE "feedback_360" ADD CONSTRAINT "feedback_360_giver_id_fkey"
    FOREIGN KEY ("giver_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedback_360" ADD CONSTRAINT "feedback_360_receiver_id_fkey"
    FOREIGN KEY ("receiver_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "employee_skills" (
    "id"              TEXT NOT NULL,
    "employee_id"     TEXT NOT NULL,
    "skill_name"      TEXT NOT NULL,
    "category"        TEXT,
    "proficiency"     TEXT NOT NULL DEFAULT 'BEGINNER',
    "years_exp"       DECIMAL(4,1),
    "is_verified"     BOOLEAN NOT NULL DEFAULT false,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "employee_skills_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "employee_skills_employee_id_skill_name_key" ON "employee_skills"("employee_id", "skill_name");
ALTER TABLE "employee_skills" ADD CONSTRAINT "employee_skills_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "skill_development_plans" (
    "id"              TEXT NOT NULL,
    "employee_id"     TEXT NOT NULL,
    "skill_name"      TEXT NOT NULL,
    "target_level"    TEXT,
    "actions"         TEXT,
    "resources"       TEXT,
    "target_date"     DATE,
    "status"          TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "skill_development_plans_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "skill_development_plans" ADD CONSTRAINT "skill_development_plans_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Learning — Certificates ───────────────────────────────────────────────────

CREATE TABLE "certificates" (
    "id"                TEXT NOT NULL,
    "employee_id"       TEXT NOT NULL,
    "certificate_name"  TEXT NOT NULL,
    "issuing_body"      TEXT,
    "issue_date"        DATE,
    "expiry_date"       DATE,
    "credential_id"     TEXT,
    "credential_url"    TEXT,
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "certificates_employee_id_idx" ON "certificates"("employee_id");
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Org — Job Postings ────────────────────────────────────────────────────────

CREATE TABLE "job_postings" (
    "id"              TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "description"     TEXT,
    "requirements"    TEXT,
    "department_id"   TEXT,
    "location"        TEXT,
    "employment_type" TEXT NOT NULL DEFAULT 'FULL_TIME',
    "salary_range"    TEXT,
    "is_internal"     BOOLEAN NOT NULL DEFAULT true,
    "status"          TEXT NOT NULL DEFAULT 'OPEN',
    "closing_date"    DATE,
    "created_by"      TEXT,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "job_postings_status_idx" ON "job_postings"("status");
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "job_applications" (
    "id"            TEXT NOT NULL,
    "job_posting_id" TEXT NOT NULL,
    "employee_id"   TEXT NOT NULL,
    "cover_note"    TEXT,
    "status"        TEXT NOT NULL DEFAULT 'APPLIED',
    "applied_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "job_applications_job_posting_id_employee_id_key" ON "job_applications"("job_posting_id", "employee_id");
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_posting_id_fkey"
    FOREIGN KEY ("job_posting_id") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Onboarding ────────────────────────────────────────────────────────────────

CREATE TABLE "onboarding_tasks" (
    "id"           TEXT NOT NULL,
    "task_title"   TEXT NOT NULL,
    "description"  TEXT,
    "category"     TEXT NOT NULL DEFAULT 'GENERAL',
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "order_index"  INTEGER NOT NULL DEFAULT 0,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "onboarding_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "onboarding_checklists" (
    "id"           TEXT NOT NULL,
    "employee_id"  TEXT NOT NULL,
    "task_id"      TEXT NOT NULL,
    "status"       TEXT NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "onboarding_checklists_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "onboarding_checklists_employee_id_task_id_key" ON "onboarding_checklists"("employee_id", "task_id");
ALTER TABLE "onboarding_checklists" ADD CONSTRAINT "onboarding_checklists_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "onboarding_checklists" ADD CONSTRAINT "onboarding_checklists_task_id_fkey"
    FOREIGN KEY ("task_id") REFERENCES "onboarding_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "policy_acknowledgements" (
    "id"             TEXT NOT NULL,
    "employee_id"    TEXT NOT NULL,
    "policy_name"    TEXT NOT NULL,
    "policy_version" TEXT NOT NULL,
    "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "policy_acknowledgements_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "policy_acknowledgements_employee_id_policy_name_version_key" ON "policy_acknowledgements"("employee_id", "policy_name", "policy_version");
CREATE INDEX "policy_acknowledgements_employee_id_idx" ON "policy_acknowledgements"("employee_id");
ALTER TABLE "policy_acknowledgements" ADD CONSTRAINT "policy_acknowledgements_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "onboarding_experience" (
    "id"             TEXT NOT NULL,
    "employee_id"    TEXT NOT NULL,
    "overall_rating" INTEGER,
    "buddy_rating"   INTEGER,
    "process_rating" INTEGER,
    "feedback"       TEXT,
    "submitted_at"   TIMESTAMP(3),
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "onboarding_experience_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "onboarding_experience_employee_id_key" ON "onboarding_experience"("employee_id");
ALTER TABLE "onboarding_experience" ADD CONSTRAINT "onboarding_experience_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Offboarding ───────────────────────────────────────────────────────────────

CREATE TABLE "resignations" (
    "id"                TEXT NOT NULL,
    "employee_id"       TEXT NOT NULL,
    "resignation_date"  DATE NOT NULL,
    "last_working_date" DATE,
    "reason"            TEXT,
    "notice_period_days" INTEGER,
    "status"            TEXT NOT NULL DEFAULT 'PENDING',
    "submitted_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resignations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "resignations_employee_id_key" ON "resignations"("employee_id");
ALTER TABLE "resignations" ADD CONSTRAINT "resignations_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "resignation_approvals" (
    "id"             TEXT NOT NULL,
    "resignation_id" TEXT NOT NULL,
    "approver_id"    TEXT NOT NULL,
    "status"         TEXT,
    "remarks"        TEXT,
    "approved_at"    TIMESTAMP(3),
    CONSTRAINT "resignation_approvals_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "resignation_approvals" ADD CONSTRAINT "resignation_approvals_resignation_id_fkey"
    FOREIGN KEY ("resignation_id") REFERENCES "resignations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resignation_approvals" ADD CONSTRAINT "resignation_approvals_approver_id_fkey"
    FOREIGN KEY ("approver_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "exit_interviews" (
    "id"              TEXT NOT NULL,
    "employee_id"     TEXT NOT NULL,
    "resignation_id"  TEXT NOT NULL,
    "reason_leaving"  TEXT,
    "job_satisfaction" INTEGER,
    "manager_rating"  INTEGER,
    "culture_rating"  INTEGER,
    "rehire_eligible" BOOLEAN NOT NULL DEFAULT true,
    "suggestions"     TEXT,
    "conducted_by"    TEXT,
    "conducted_at"    TIMESTAMP(3),
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exit_interviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "exit_interviews_employee_id_key" ON "exit_interviews"("employee_id");
CREATE UNIQUE INDEX "exit_interviews_resignation_id_key" ON "exit_interviews"("resignation_id");
ALTER TABLE "exit_interviews" ADD CONSTRAINT "exit_interviews_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "exit_interviews" ADD CONSTRAINT "exit_interviews_resignation_id_fkey"
    FOREIGN KEY ("resignation_id") REFERENCES "resignations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "fnf_settlements" (
    "id"              TEXT NOT NULL,
    "employee_id"     TEXT NOT NULL,
    "resignation_id"  TEXT NOT NULL,
    "gratuity"        DECIMAL(12,2),
    "leave_encashment" DECIMAL(12,2),
    "bonus"           DECIMAL(12,2),
    "deductions"      DECIMAL(12,2),
    "net_payable"     DECIMAL(12,2),
    "payment_date"    DATE,
    "status"          TEXT NOT NULL DEFAULT 'PENDING',
    "remarks"         TEXT,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fnf_settlements_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "fnf_settlements_employee_id_key" ON "fnf_settlements"("employee_id");
CREATE UNIQUE INDEX "fnf_settlements_resignation_id_key" ON "fnf_settlements"("resignation_id");
ALTER TABLE "fnf_settlements" ADD CONSTRAINT "fnf_settlements_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fnf_settlements" ADD CONSTRAINT "fnf_settlements_resignation_id_fkey"
    FOREIGN KEY ("resignation_id") REFERENCES "resignations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "offboarding_tasks" (
    "id"           TEXT NOT NULL,
    "task_title"   TEXT NOT NULL,
    "description"  TEXT,
    "category"     TEXT NOT NULL DEFAULT 'GENERAL',
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "order_index"  INTEGER NOT NULL DEFAULT 0,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "offboarding_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "offboarding_checklists" (
    "id"           TEXT NOT NULL,
    "employee_id"  TEXT NOT NULL,
    "task_id"      TEXT NOT NULL,
    "status"       TEXT NOT NULL DEFAULT 'PENDING',
    "remarks"      TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "offboarding_checklists_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "offboarding_checklists_employee_id_task_id_key" ON "offboarding_checklists"("employee_id", "task_id");
ALTER TABLE "offboarding_checklists" ADD CONSTRAINT "offboarding_checklists_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "offboarding_checklists" ADD CONSTRAINT "offboarding_checklists_task_id_fkey"
    FOREIGN KEY ("task_id") REFERENCES "offboarding_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
