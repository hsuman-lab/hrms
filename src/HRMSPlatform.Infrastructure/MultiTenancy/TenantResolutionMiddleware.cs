using HRMSPlatform.SharedKernel.MultiTenancy;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace HRMSPlatform.Infrastructure.MultiTenancy;

/// <summary>
/// Resolves tenant from subdomain or JWT claim and sets ITenantContext.
/// Order: JWT claim → subdomain header → Host header.
/// </summary>
public sealed class TenantResolutionMiddleware(
    RequestDelegate next,
    ILogger<TenantResolutionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext,
        ITenantLookupService tenantLookup)
    {
        // Skip tenant resolution for platform-admin endpoints and health checks
        var path = context.Request.Path.Value ?? string.Empty;
        if (path.StartsWith("/platform-admin") || path.StartsWith("/health") || path.StartsWith("/swagger"))
        {
            await next(context);
            return;
        }

        try
        {
            TenantInfo? tenant = null;

            // 1. Try JWT claim first (set during auth)
            var tenantIdClaim = context.User.FindFirst("tid")?.Value;
            if (tenantIdClaim is not null && Guid.TryParse(tenantIdClaim, out var tenantIdFromJwt))
            {
                tenant = await tenantLookup.GetByIdAsync(tenantIdFromJwt);
            }

            // 2. Fallback to subdomain from Host header
            if (tenant is null)
            {
                var host = context.Request.Host.Host;
                var slug = ExtractSlug(host);
                if (!string.IsNullOrEmpty(slug))
                    tenant = await tenantLookup.GetBySlugAsync(slug);
            }

            // 3. Fallback to X-Tenant-ID header (machine-to-machine)
            if (tenant is null)
            {
                var headerTenantId = context.Request.Headers["X-Tenant-ID"].FirstOrDefault();
                if (headerTenantId is not null && Guid.TryParse(headerTenantId, out var hTenantId))
                    tenant = await tenantLookup.GetByIdAsync(hTenantId);
            }

            if (tenant is not null)
            {
                tenantContext.SetTenant(tenant.Id, tenant.Slug, tenant.DbSchema);
                context.Items["TenantId"] = tenant.Id;
            }
            else if (!IsPublicEndpoint(path))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await context.Response.WriteAsJsonAsync(new { error = "Tenant could not be resolved." });
                return;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Tenant resolution failed");
        }

        await next(context);
    }

    private static string? ExtractSlug(string host)
    {
        // acme.hrms.io → acme
        var parts = host.Split('.');
        return parts.Length >= 3 ? parts[0] : null;
    }

    private static bool IsPublicEndpoint(string path) =>
        path.StartsWith("/api/v1/auth/login") ||
        path.StartsWith("/api/v1/auth/sso") ||
        path.StartsWith("/api/v1/tenants/register");
}
