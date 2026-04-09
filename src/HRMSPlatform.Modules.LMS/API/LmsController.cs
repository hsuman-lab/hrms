using HRMSPlatform.Modules.LMS.Domain;
using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRMSPlatform.Modules.LMS.API;

[ApiController]
[Route("api/v1/lms")]
[Authorize]
public sealed class LmsController(Infrastructure.LmsDbContext db, ITenantContext tenant) : ControllerBase
{
    /// <summary>List published courses for the tenant.</summary>
    [HttpGet("courses")]
    public async Task<IActionResult> ListCourses(
        [FromQuery] string? category, [FromQuery] bool? mandatory, CancellationToken ct)
    {
        var q = db.Courses.Where(c => c.TenantId == tenant.TenantId && c.IsPublished);
        if (!string.IsNullOrEmpty(category)) q = q.Where(c => c.Category == category);
        if (mandatory.HasValue) q = q.Where(c => c.IsMandatory == mandatory.Value);
        return Ok(await q.Select(c => new { c.Id, c.Title, c.Type, c.IsMandatory, c.DurationMins }).ToListAsync(ct));
    }

    /// <summary>Create a new course.</summary>
    [HttpPost("courses")]
    [Authorize(Roles = "HR_ADMIN,LMS_ADMIN")]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest req, CancellationToken ct)
    {
        var course = Course.Create(tenant.TenantId, req.Title, req.Type, req.IsMandatory, req.S3Key);
        await db.Courses.AddAsync(course, ct);
        await db.SaveChangesAsync(ct);
        return Created($"api/v1/lms/courses/{course.Id}", new { course.Id });
    }

    /// <summary>Enroll an employee in a course.</summary>
    [HttpPost("courses/{courseId:guid}/enroll")]
    public async Task<IActionResult> Enroll(Guid courseId, [FromBody] EnrollRequest req, CancellationToken ct)
    {
        var existing = await db.Enrollments
            .AnyAsync(e => e.TenantId == tenant.TenantId && e.EmployeeId == req.EmployeeId && e.CourseId == courseId, ct);
        if (existing) return Conflict(new { error = "Employee already enrolled." });

        var enrollment = Enrollment.Create(tenant.TenantId, req.EmployeeId, courseId, req.AssignedBy, req.DueDate);
        await db.Enrollments.AddAsync(enrollment, ct);
        await db.SaveChangesAsync(ct);
        return Created($"api/v1/lms/enrollments/{enrollment.Id}", new { enrollment.Id });
    }

    /// <summary>Track SCORM/xAPI progress.</summary>
    [HttpPost("progress/track")]
    public async Task<IActionResult> TrackProgress([FromBody] TrackProgressRequest req, CancellationToken ct)
    {
        var enrollment = await db.Enrollments.FindAsync([req.EnrollmentId], ct);
        if (enrollment is null || enrollment.TenantId != tenant.TenantId) return NotFound();

        enrollment.UpdateProgress(req.ProgressPct);
        if (req.ProgressPct >= 100) enrollment.Complete(req.Score);

        await db.SaveChangesAsync(ct);
        return Ok(new { enrollment.Status, enrollment.ProgressPct });
    }

    /// <summary>Get certificates for an employee.</summary>
    [HttpGet("certificates/{employeeId:guid}")]
    public async Task<IActionResult> GetCertificates(Guid employeeId, CancellationToken ct)
    {
        var certs = await db.Certificates
            .Where(c => c.TenantId == tenant.TenantId && c.EmployeeId == employeeId)
            .ToListAsync(ct);
        return Ok(certs);
    }
}

public record CreateCourseRequest(string Title, CourseType Type, bool IsMandatory, string? S3Key);
public record EnrollRequest(Guid EmployeeId, Guid? AssignedBy, DateOnly? DueDate);
public record TrackProgressRequest(Guid EnrollmentId, int ProgressPct, int? Score);
