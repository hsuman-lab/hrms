export declare class PmsService {
    getMyGoals(employeeId: string, period?: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        employee_id: string;
        title: string;
        progress_pct: number;
        due_date: Date | null;
        goal_type: string;
        metric_type: string;
        target_value: string | null;
        achieved_value: string | null;
        weightage: import("@prisma/client/runtime/library").Decimal | null;
        review_period: string | null;
    }[]>;
    getTeamGoals(managerId: string, period?: string): Promise<({
        employee: {
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        employee_id: string;
        title: string;
        progress_pct: number;
        due_date: Date | null;
        goal_type: string;
        metric_type: string;
        target_value: string | null;
        achieved_value: string | null;
        weightage: import("@prisma/client/runtime/library").Decimal | null;
        review_period: string | null;
    })[]>;
    createGoal(employeeId: string, data: {
        title: string;
        description?: string;
        goalType?: string;
        metricType?: string;
        targetValue?: string;
        weightage?: number;
        dueDate?: string;
        reviewPeriod?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        employee_id: string;
        title: string;
        progress_pct: number;
        due_date: Date | null;
        goal_type: string;
        metric_type: string;
        target_value: string | null;
        achieved_value: string | null;
        weightage: import("@prisma/client/runtime/library").Decimal | null;
        review_period: string | null;
    }>;
    updateGoal(id: string, employeeId: string, data: {
        title?: string;
        description?: string;
        achievedValue?: string;
        progressPct?: number;
        status?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        description: string | null;
        status: string;
        employee_id: string;
        title: string;
        progress_pct: number;
        due_date: Date | null;
        goal_type: string;
        metric_type: string;
        target_value: string | null;
        achieved_value: string | null;
        weightage: import("@prisma/client/runtime/library").Decimal | null;
        review_period: string | null;
    }>;
    getMySelfAssessments(employeeId: string): Promise<({
        manager_review: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            review_period: string;
            strengths: string | null;
            improvements: string | null;
            overall_comment: string | null;
            self_assessment_id: string;
            reviewee_id: string;
            reviewer_id: string;
            rating_manager: import("@prisma/client/runtime/library").Decimal | null;
            final_rating: import("@prisma/client/runtime/library").Decimal | null;
            reviewed_at: Date | null;
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        employee_id: string;
        review_period: string;
        strengths: string | null;
        improvements: string | null;
        achievements: string | null;
        rating_self: import("@prisma/client/runtime/library").Decimal | null;
        overall_comment: string | null;
        submitted_at: Date | null;
    })[]>;
    upsertSelfAssessment(employeeId: string, data: {
        reviewPeriod: string;
        strengths?: string;
        improvements?: string;
        achievements?: string;
        ratingSelf?: number;
        overallComment?: string;
        submit?: boolean;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        employee_id: string;
        review_period: string;
        strengths: string | null;
        improvements: string | null;
        achievements: string | null;
        rating_self: import("@prisma/client/runtime/library").Decimal | null;
        overall_comment: string | null;
        submitted_at: Date | null;
    }>;
    getPendingReviews(managerId: string): Promise<({
        employee: {
            employee_code: string;
            first_name: string | null;
            last_name: string | null;
        };
        manager_review: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: string;
            review_period: string;
            strengths: string | null;
            improvements: string | null;
            overall_comment: string | null;
            self_assessment_id: string;
            reviewee_id: string;
            reviewer_id: string;
            rating_manager: import("@prisma/client/runtime/library").Decimal | null;
            final_rating: import("@prisma/client/runtime/library").Decimal | null;
            reviewed_at: Date | null;
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        employee_id: string;
        review_period: string;
        strengths: string | null;
        improvements: string | null;
        achievements: string | null;
        rating_self: import("@prisma/client/runtime/library").Decimal | null;
        overall_comment: string | null;
        submitted_at: Date | null;
    })[]>;
    submitManagerReview(managerId: string, selfAssessmentId: string, data: {
        ratingManager?: number;
        strengths?: string;
        improvements?: string;
        overallComment?: string;
        finalRating?: number;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        review_period: string;
        strengths: string | null;
        improvements: string | null;
        overall_comment: string | null;
        self_assessment_id: string;
        reviewee_id: string;
        reviewer_id: string;
        rating_manager: import("@prisma/client/runtime/library").Decimal | null;
        final_rating: import("@prisma/client/runtime/library").Decimal | null;
        reviewed_at: Date | null;
    }>;
    getFeedbackReceived(employeeId: string): Promise<({
        giver: {
            first_name: string | null;
            last_name: string | null;
        };
    } & {
        id: string;
        created_at: Date;
        relationship: string;
        review_period: string;
        strengths: string | null;
        improvements: string | null;
        submitted_at: Date | null;
        giver_id: string;
        receiver_id: string;
        rating: import("@prisma/client/runtime/library").Decimal | null;
        is_anonymous: boolean;
    })[]>;
    submitFeedback(giverId: string, data: {
        receiverId: string;
        reviewPeriod: string;
        relationship: string;
        strengths?: string;
        improvements?: string;
        rating?: number;
        isAnonymous?: boolean;
    }): Promise<{
        id: string;
        created_at: Date;
        relationship: string;
        review_period: string;
        strengths: string | null;
        improvements: string | null;
        submitted_at: Date | null;
        giver_id: string;
        receiver_id: string;
        rating: import("@prisma/client/runtime/library").Decimal | null;
        is_anonymous: boolean;
    }>;
    getSkills(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        employee_id: string;
        category: string;
        skill_name: string;
        proficiency: string;
        endorsed_by: string | null;
    }[]>;
    addSkill(employeeId: string, data: {
        skillName: string;
        category?: string;
        proficiency?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        employee_id: string;
        category: string;
        skill_name: string;
        proficiency: string;
        endorsed_by: string | null;
    }>;
    deleteSkill(id: string, employeeId: string): Promise<{
        success: boolean;
    }>;
    getSkillPlans(employeeId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        employee_id: string;
        skill_name: string;
        current_level: string | null;
        target_level: string | null;
        action_items: string | null;
        resources: string | null;
        target_date: Date | null;
    }[]>;
    createSkillPlan(employeeId: string, data: {
        skillName: string;
        currentLevel?: string;
        targetLevel?: string;
        actionItems?: string;
        resources?: string;
        targetDate?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        employee_id: string;
        skill_name: string;
        current_level: string | null;
        target_level: string | null;
        action_items: string | null;
        resources: string | null;
        target_date: Date | null;
    }>;
    updateSkillPlan(id: string, employeeId: string, data: {
        actionItems?: string;
        resources?: string;
        targetDate?: string;
        status?: string;
    }): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: string;
        employee_id: string;
        skill_name: string;
        current_level: string | null;
        target_level: string | null;
        action_items: string | null;
        resources: string | null;
        target_date: Date | null;
    }>;
}
declare const _default: PmsService;
export default _default;
//# sourceMappingURL=pms.service.d.ts.map