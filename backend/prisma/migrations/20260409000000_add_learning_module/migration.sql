-- CreateTable: courses
CREATE TABLE "courses" (
    "id"            TEXT NOT NULL,
    "title"         TEXT NOT NULL,
    "description"   TEXT,
    "category"      TEXT NOT NULL DEFAULT 'GENERAL',
    "is_mandatory"  BOOLEAN NOT NULL DEFAULT false,
    "duration_mins" INTEGER,
    "created_by"    TEXT,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable: course_enrollments
CREATE TABLE "course_enrollments" (
    "id"           TEXT NOT NULL,
    "course_id"    TEXT NOT NULL,
    "employee_id"  TEXT NOT NULL,
    "status"       TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "due_date"     TIMESTAMP(3),
    "assigned_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_course_id_employee_id_key" ON "course_enrollments"("course_id", "employee_id");
CREATE INDEX "course_enrollments_employee_id_status_idx" ON "course_enrollments"("employee_id", "status");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_employee_id_fkey"
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
