using HRMSPlatform.Modules.Audit.Infrastructure;
using HRMSPlatform.SharedKernel.MultiTenancy;

namespace HRMSPlatform.API.Middleware;

/// <summary>
/// Automatically logs all state-changing HTTP requests (POST, PUT, PATCH, DELETE)
/// to the immutable audit trail.
/// </summary>
public sealed class AuditLoggingMiddleware(RequestDelegate next)
{
    private static readonly HashSet<string> MutatingMethods =
        new(StringComparer.OrdinalIgnoreCase) { "POST", "PUT", "PATCH", "DELETE" };

    public async Task InvokeAsync(HttpContext context)
    {
        await next(context);

        // Only audit mutating requests that succeeded
        if (!MutatingMethods.Contains(context.Request.Method)) return;
        if (context.Response.StatusCode >= 500) return;

        var tenantContext = context.RequestServices.GetService<ITenantContext>();
        if (tenantContext is null || !tenantContext.IsResolved) return;

        var auditService = context.RequestServices.GetService<IAuditService>();
        if (auditService is null) return;

        var actorId = GetUserId(context);
        var path = context.Request.Path.Value ?? string.Empty;
        var action = $"{context.Request.Method}:{path}";

        await auditService.LogAsync(
            tenantId: tenantContext.TenantId,
            actorId: actorId,
            action: action,
            resourceType: ExtractResourceType(path),
            resourceId: ExtractResourceId(path),
            ipAddress: context.Connection.RemoteIpAddress?.ToString());
    }

    private static Guid? GetUserId(HttpContext context)
    {
        var claim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private static string ExtractResourceType(string path)
    {
        // /api/v1/employees/xxx → employees
        var segments = path.TrimStart('/').Split('/');
        return segments.Length >= 3 ? segments[2] : path;
    }

    private static Guid? ExtractResourceId(string path)
    {
        var segments = path.TrimStart('/').Split('/');
        foreach (var seg in segments)
            if (Guid.TryParse(seg, out var id)) return id;
        return null;
    }
}
