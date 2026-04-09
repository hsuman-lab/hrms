using HRMSPlatform.SharedKernel.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace HRMSPlatform.Infrastructure.MultiTenancy;

/// <summary>
/// Looks up tenant info from the TenantManagement module DB.
/// Cached in Redis with 5-minute TTL to avoid DB round-trips on every request.
/// </summary>
public sealed class TenantLookupService(
    IServiceScopeFactory scopeFactory,
    ICacheService cache) : ITenantLookupService
{
    public async Task<TenantInfo?> GetByIdAsync(Guid tenantId)
    {
        var cacheKey = $"tenant:id:{tenantId}";
        return await cache.GetOrSetAsync(cacheKey,
            async () => await LookupByIdFromDb(tenantId),
            TimeSpan.FromMinutes(5));
    }

    public async Task<TenantInfo?> GetBySlugAsync(string slug)
    {
        var cacheKey = $"tenant:slug:{slug}";
        return await cache.GetOrSetAsync(cacheKey,
            async () => await LookupBySlugFromDb(slug),
            TimeSpan.FromMinutes(5));
    }

    public Task<TenantInfo?> GetByDomainAsync(string domain) =>
        GetBySlugAsync(domain);

    private async Task<TenantInfo?> LookupByIdFromDb(Guid tenantId)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        // Dynamic lookup via raw SQL to avoid circular dependency on TenantDbContext
        var db = scope.ServiceProvider.GetRequiredService<Persistence.HrmsDbContext>();
        var result = await db.Database
            .SqlQueryRaw<TenantRow>(
                "SELECT id, slug, db_schema_name, status, plan_id FROM tenants WHERE id = {0} AND status != 'Churned'",
                tenantId)
            .ToAsyncEnumerable()
            .FirstOrDefaultAsync();

        return result is null ? null
            : new TenantInfo(result.Id, result.Slug, result.DbSchemaName, result.Status, result.PlanId.ToString());
    }

    private async Task<TenantInfo?> LookupBySlugFromDb(string slug)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<Persistence.HrmsDbContext>();
        var result = await db.Database
            .SqlQueryRaw<TenantRow>(
                "SELECT id, slug, db_schema_name, status, plan_id FROM tenants WHERE slug = {0} AND status != 'Churned'",
                slug.ToLowerInvariant())
            .ToAsyncEnumerable()
            .FirstOrDefaultAsync();

        return result is null ? null
            : new TenantInfo(result.Id, result.Slug, result.DbSchemaName, result.Status, result.PlanId.ToString());
    }

    private sealed record TenantRow(Guid Id, string Slug, string DbSchemaName, string Status, Guid PlanId);
}
