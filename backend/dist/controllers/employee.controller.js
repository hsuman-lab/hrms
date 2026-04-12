"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const zod_1 = require("zod");
const employee_service_1 = __importDefault(require("../services/employee.service"));
const audit_1 = require("../utils/audit");
const createEmployeeSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    roleId: zod_1.z.string().min(1),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    phone: zod_1.z.string().optional(),
    whatsappNo: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().min(1).optional(),
    managerId: zod_1.z.string().min(1).optional(),
    joiningDate: zod_1.z.string().optional(),
    baseSalary: zod_1.z.number().positive().optional(),
    employeeCode: zod_1.z.string().min(1),
    salaryStructure: zod_1.z.object({
        basicPct: zod_1.z.number().optional(),
        hraPct: zod_1.z.number().optional(),
        daPct: zod_1.z.number().optional(),
        specialAllowancePct: zod_1.z.number().optional(),
        otherAllowance: zod_1.z.number().optional(),
        pfEmployeePct: zod_1.z.number().optional(),
        esiApplicable: zod_1.z.boolean().optional(),
        professionalTax: zod_1.z.number().optional(),
        tdsMonthly: zod_1.z.number().optional(),
    }).optional(),
});
const salaryStructureSchema = zod_1.z.object({
    basicPct: zod_1.z.number().optional(),
    hraPct: zod_1.z.number().optional(),
    daPct: zod_1.z.number().optional(),
    specialAllowancePct: zod_1.z.number().optional(),
    otherAllowance: zod_1.z.number().optional(),
    pfEmployeePct: zod_1.z.number().optional(),
    esiApplicable: zod_1.z.boolean().optional(),
    professionalTax: zod_1.z.number().optional(),
    tdsMonthly: zod_1.z.number().optional(),
});
const updateEmployeeSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().min(1).optional(),
    managerId: zod_1.z.string().min(1).optional(),
    employmentStatus: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED']).optional(),
    baseSalary: zod_1.z.number().positive().optional(),
});
class EmployeeController {
    async getAll(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await employee_service_1.default.getAllEmployees(page, limit);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async getById(req, res, next) {
        try {
            const employee = await employee_service_1.default.getEmployeeById(req.params.id);
            res.json({ success: true, data: employee });
        }
        catch (err) {
            next(err);
        }
    }
    async getMyProfile(req, res, next) {
        try {
            const employee = await employee_service_1.default.getMyProfile(req.user.userId);
            res.json({ success: true, data: employee });
        }
        catch (err) {
            next(err);
        }
    }
    async create(req, res, next) {
        try {
            const data = createEmployeeSchema.parse(req.body);
            const employee = await employee_service_1.default.createEmployee(data);
            await (0, audit_1.logAudit)(req.user?.userId, 'CREATE_EMPLOYEE', 'Employee', employee.id);
            res.status(201).json({ success: true, data: employee });
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const data = updateEmployeeSchema.parse(req.body);
            const employee = await employee_service_1.default.updateEmployee(req.params.id, data);
            await (0, audit_1.logAudit)(req.user?.userId, 'UPDATE_EMPLOYEE', 'Employee', req.params.id);
            res.json({ success: true, data: employee });
        }
        catch (err) {
            next(err);
        }
    }
    async updateSalaryStructure(req, res, next) {
        try {
            const data = salaryStructureSchema.parse(req.body);
            const result = await employee_service_1.default.updateSalaryStructure(req.params.id, data);
            await (0, audit_1.logAudit)(req.user?.userId, 'UPDATE_SALARY_STRUCTURE', 'Employee', req.params.id);
            res.json({ success: true, data: result });
        }
        catch (err) {
            next(err);
        }
    }
    async hasSubordinates(req, res, next) {
        try {
            if (!req.user?.employeeId) {
                res.json({ success: true, data: { isManager: false } });
                return;
            }
            const count = await (await Promise.resolve().then(() => __importStar(require('../config/database')))).default.employee.count({
                where: { manager_id: req.user.employeeId },
            });
            res.json({ success: true, data: { isManager: count > 0, subordinateCount: count } });
        }
        catch (err) {
            next(err);
        }
    }
    async getTeam(req, res, next) {
        try {
            const managerId = req.user.employeeId;
            const team = await employee_service_1.default.getTeamMembers(managerId);
            res.json({ success: true, data: team });
        }
        catch (err) {
            next(err);
        }
    }
    async getDashboard(req, res, next) {
        try {
            const employeeId = req.user.employeeId;
            const stats = await employee_service_1.default.getDashboardStats(employeeId);
            res.json({ success: true, data: stats });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.EmployeeController = EmployeeController;
exports.default = new EmployeeController();
//# sourceMappingURL=employee.controller.js.map