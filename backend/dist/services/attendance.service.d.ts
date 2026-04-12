export declare class AttendanceService {
    clockIn(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        status: string | null;
        employee_id: string;
        attendance_date: Date;
        clock_in: Date | null;
        clock_out: Date | null;
    }>;
    clockOut(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        status: string | null;
        employee_id: string;
        attendance_date: Date;
        clock_in: Date | null;
        clock_out: Date | null;
    }>;
    getAttendanceHistory(employeeId: string, startDate?: string, endDate?: string, page?: number, limit?: number): Promise<{
        records: {
            id: string;
            created_at: Date;
            status: string | null;
            employee_id: string;
            attendance_date: Date;
            clock_in: Date | null;
            clock_out: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getTodayStatus(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        status: string | null;
        employee_id: string;
        attendance_date: Date;
        clock_in: Date | null;
        clock_out: Date | null;
    } | null>;
    getTeamAttendance(managerId: string, date?: string): Promise<{
        attendance: {
            id: string;
            created_at: Date;
            status: string | null;
            employee_id: string;
            attendance_date: Date;
            clock_in: Date | null;
            clock_out: Date | null;
        } | null;
        id: string;
        employee_code: string;
        first_name: string | null;
        last_name: string | null;
    }[]>;
    getMonthlyReport(year: number, month: number): Promise<({
        employee: {
            department: {
                id: string;
                created_at: Date;
                description: string | null;
                department_name: string;
            } | null;
            id: string;
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        status: string | null;
        employee_id: string;
        attendance_date: Date;
        clock_in: Date | null;
        clock_out: Date | null;
    })[]>;
}
declare const _default: AttendanceService;
export default _default;
//# sourceMappingURL=attendance.service.d.ts.map